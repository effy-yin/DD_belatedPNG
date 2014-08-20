var DD = {
	animate: {
		ease: function(type, tween) {
			switch (type) {
			case 'quadIn':
				return Math.pow(tween, 4);
				break;
			case 'quadOut':
				return -(Math.pow(--tween, 4) - 1);
				break;
			case 'quadInOut':
				return (tween <= .5)? Math.pow(tween*2, 4)/2 : -(Math.pow(--tween*2, 4) - 2)/2;
				break;
			}
		},
		go: function(node, time, step, direction, func, extras) {
			var i = 0;
			if (!node.inProgress) {
				clearInterval(node.loop);
				node.inProgress = true;
				node.loop = setInterval(function() {
					node.tween = Math.abs((++i*step)/time + (direction? 0 : -1));
					func(node, node.tween);
					if (i >= Math.ceil(time/step)) {
						node.inProgress = false;
						clearInterval(node.loop);
						extras && extras.end? extras.end() : null;
					}
				}, step);
			}
			return node;
		},
		stop: function(node) {
			clearInterval(node.loop);
			node.inProgress = false;
			return node;
		}
	},
	debug: function(error) {
		if (document.body) {
			if (document.getElementById('DDJSERRCONSOLE')) {
				var newError = document.createElement('div');
				newError.className = 'entry';
				newError.innerHTML = error;
				var errorConsole = document.getElementById('DDJSERRCONSOLE');
				errorConsole.insertBefore(newError, errorConsole.firstChild);
			}
			else {
				var errorConsole = document.createElement('div');
				errorConsole.id = 'DDJSERRCONSOLE';
				document.body.insertBefore(errorConsole, document.body.firstChild);
				DD.debug(error);
			}
		}
		else {
			setTimeout(function() {
				DD.debug(error);
			}, 100);
		}
	},
	dom: {
		addClass: function(node, str) {
			
		},
		ancestor: function(node, test) {
			if (node.nodeType == 9) {
				return false;
			}
			var queried = 0;
			var passed = 0;
			for (var i in test) {
				queried++;
				var pass = (node[i] == test[i]);
				switch(i) {
				case 'class':
					pass = DD.dom.hasClass(node, test[i]);
					break;
				}
				pass? passed++ : null;
			}
			return (queried == passed)? node : DD.dom.ancestor(node.parentNode, test);
		},
		getClassNameRegex: function(str) {
			return RegExp('(?:^|\\s+)' + str + '(?:\\s+|$)');
		},
		hasClass: function(node, str) {
			return node.className.match(DD.dom.getClassNameRegex(str));
		},
		id: function(id) {
			return document.getElementById(id);
		},
		removeClass: function(node, str) {
			
		}
	},
	event: {
		add: function(obj, type, fn) { /* this differs from John Resig's addEvent in that a random number is injected into the hash */
			if (obj) {
				if (obj.attachEvent) {
					var rand = Math.random();
					obj['e'+type+fn+rand] = fn;
					obj[type+fn+rand] = function() {
						obj['e'+type+fn+rand](window.event);
					};
					obj.attachEvent('on'+type, obj[type+fn+rand]);
				}
				else {
					obj.addEventListener(type, fn, false);
				}
			}
			else {
				DD.debug('obj does not exist');
			}
		},
		delegateTypes: {},
		delegateFuncs: {},
		delegate: function(css, type, func) {
			DD.event.delegateFuncs[css+type] = func;
			if (!DD.event.delegateTypes[type]) {
				DD.event.delegateTypes[type] = new Array;
				DD.event.add(document, type, function(e) {
					e = e? e : window.event;
					var node = DD.event.target(e);
					var trunk = node;
					var obj = false;
					var i = 0;
					var tree = {};
					do {
						i++;
						if (trunk.nodeType != 9) {
							tree[i] = trunk;
							tree[trunk.nodeName] = i;
							if (trunk.className) {
								var classNames = trunk.className.split(' ');
								for (var c in classNames) {
									tree[trunk.nodeName + '.' + classNames[c]] = i;
									tree['.' + classNames[c]] = i;
								}
							}
							if (trunk.id) {
								tree[trunk.nodeName + '#' + trunk.id] = i;
								tree['#' + trunk.id] = i;
							}
						}
					} while (trunk = trunk.parentNode);
					for (var _css in DD.event.delegateTypes[type]) {
						var tests = 0;
						var order = 0;
						var parts = _css.split(' ').reverse();
						for (var p in parts) {
							if (tree[parts[p]] && tree[parts[p]] > order) {
								if (!obj) {
									obj = node;
									var findParent = tree[parts[p]];
									for (var n=1; n<findParent; n++) {
										obj = node.parentNode;
									}
								}
								tests++;
								order = tree[parts[p]];
							}
						}
						if (tests == parts.length) {
							DD.event.delegateFuncs[_css+type](obj, e);
						}
					}
				});
			}
			DD.event.delegateTypes[type][css] = true;
		},
		domReadyQueue: Array(),
		domReady: function(func) {
			DD.event.domReadyQueue.push(func);
		},
		domReadyCheck: function() {
			DD.event.checkDomState = setInterval(function() {
				if (document.body && document.body.innerHTML.search('<!-- DOM -->') != -1) {
					DD.event.domReadyExec();
				}
			}, 400);
		},
		domReadyExec: function() {
			clearInterval(DD.event.checkDomState);
			for (var i in DD.event.domReadyQueue) {
				DD.event.domReadyQueue[i]();
			}
		},
		mouseWheel: function(e) { // alpha!
			DD.event.prevent(e);
			var delta = e.wheelDelta? e.wheelDelta/120 : -e.detail/3;
			return (delta > 0);
		},
		prevent: function(e) {
			e = e? e : window.event;
			if (e) {
				e.preventDefault? e.preventDefault() : null;
				e.returnValue = false;
			}
		},
		target: function(e) {
			e = e? e : window.event;
			return e.target? e.target : e.srcElement;
		}
	},
	fade: function(node, direction, extras) {
		var time = (extras && extras.time)? extras.time : 100;
		var step = (extras && extras.step)? extras.step : 10;
		DD.animate.go(node, time, step, direction, function(obj, tween) {
			DD.opacity(obj, tween);
		}, extras);
		return node;
	},
	key: {
		action: {},
		depressed: {},
		log: false,
		wild: null,
		press: function(e) {
			if (DD.key.wild != null) {
				var code = (document.all) ? e.keyCode : e.charCode;
				DD.key.wild(String.fromCharCode(code));
				if (!DD.key.depressed[16] && !DD.key.depressed[17]) {
					return false;
				}
			}
		},
		down: function(e) {
			DD.key.log? DD.debug(e.keyCode) : null;
			DD.key.depressed[e.keyCode] = true;
			if (DD.key.action[e.keyCode]) {
				DD.key.action[e.keyCode](e);
				return false;
			}
		},
		up: function(e) {
			DD.key.depressed[e.keyCode] = false;
		}
	},
	modal: {
		create: function(content) {
			if (!DD.dom.id(DD.modal.id)) {
				var modal = document.createElement('div');
				modal.id = DD.modal.id;
				var closeBox = document.createElement('a');
				closeBox.href = '#';
				closeBox.innerHTML = 'X';
				closeBox.className = 'pa box R0 T0 DD_MODAL_CLOSE';
				modal.appendChild(content);
				modal.appendChild(closeBox);
				DD.fade(modal, true, {time:50, step:10});
				document.body.appendChild(modal);
				DD.modal.position();
			}
		},
		destroy: function() {
			var modal;
			if (modal = DD.modal.get()) {
				DD.fade(modal, false,  {time:50, step:10, end: function() {
					modal.parentNode.removeChild(modal);
				}});
			}
		},
		get: function() {
			return DD.dom.id(DD.modal.id);
		},
		id: 'DD_MODAL',
		position: function() {
			var modal = DD.modal.get();
			var viewportHeight = document.body.clientHeight;
			var scrollTop = document.body.scrollTop;
			modal.style.top = scrollTop + viewportHeight/2 - modal.offsetHeight/2 + 'px';
			modal.style.marginLeft = -modal.offsetWidth/2 + 'px';
		}
	},
	opacity: function(node, degree) {
		node.style.visibility = (degree != 0)? 'visible' : 'hidden';
		node.style.opacity = degree;
		node.style.filter = 'alpha(opacity='+ degree*100 +')';
	}
};

DD.event.add(document, 'keydown', DD.key.down);
DD.event.add(document, 'keypress', DD.key.press);
DD.event.add(document, 'keyup', DD.key.up);

DD.event.delegate('.DD_MODAL_CLOSE', 'click', function(node, e) {
	DD.event.prevent(e);
	node.blur();
	DD.modal.destroy();
});

DD.event.domReadyCheck();