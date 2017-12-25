/* eslint-disable */
//=include Polyfill.module.js
/* eslint-enable */
!function(doc, win){
	var $ = function(selector, parent){
		return (parent || doc).querySelector(selector);
	};
	var $$ = function(selector, parent){
		return makeArray((parent || doc).querySelectorAll(selector));
	};
	var makeArray = function(likeArray){
		var i, l, array = [];
		for(i = 0, l = likeArray.length; i < l; i++){
			array[i] = likeArray[i];
		}
		array.length = l;
		return array;
	};
	//=include LazyLoad.module.js
	//=include FilterBar.module.js
	// 主页焦点图
	!function(elements){
		var WebSlider = function(){};
		WebSlider.prototype = {
			constructor: WebSlider,
			init: function(element){
				this.element = element;
				this.bItems = $$('.ws-stage li', element);
				this.sItems = $$('.ws-pics li', element);
				this.startWith = 0;
				this.uid = 0;
				this.current = -1;
				this.select(this.startWith);
				this.auto();
				var me = this;
				this.sItems.forEach(function(node, index){
					node.addEventListener('mouseenter', function(){
						if (me.current !== index) {
							me.select(index);
						}
					}, false);
				});
			},
			auto: function(){},
			select: function(index){
				var bItems = this.bItems,
					sItems = this.sItems,
					current = this.current,
					curItem, prevItem;
				if (!bItems[index]) {
					index = 0;
				}
				curItem = bItems[index];
				prevItem = bItems[current];
				bItems.forEach(function(node){
					node.classList.remove('cur');
					node.classList.remove('prev');
				});
				curItem.classList.add('cur');
				this.lazy(curItem);
				if (prevItem) {
					prevItem.classList.add('prev');
					this.lazy(prevItem);
				}
				this.animate(curItem, prevItem);
				sItems.forEach(function(node){
					node.classList.remove('cur');
				});
				sItems[index].classList.add('cur');
				this.current = index;
			},
			animate: function(inNode, outNode){
				if (!outNode || eval('!-[1,]')) {
					return;
				}
				var me = this,
					uid = ++this.uid,
					ease = function(t,b,c,d){
						return c*(t/=d)*t + b;
					},
					t = 0,
					d = Math.ceil(500/16),
					fn = function(){
						if (uid !== me.uid || t++ >= d) {
							opacity(inNode, 1);
							opacity(outNode, 0);
						} else {
							opacity(inNode, ease(t, 0, 1, d));
							opacity(outNode, ease(t, 1, -1, d));
							requestAnimationFrame(fn);
						}
					},
					opacity = this.opacity;
				opacity(inNode, 0);
				opacity(outNode, 1);
				requestAnimationFrame(fn);
			},
			opacity: function(node, value){
				node.style.opacity = value;
			},
			lazy: function(){
				var nodes = Array.prototype.slice.apply(arguments);
				nodes.forEach(function(node){
					var image = $('img[data-src]', node);
					if (image) {
						image.src = image.getAttribute('data-src');
						image.removeAttribute('data-src');
					}
				});
			}
		};
		elements.forEach(function(element){
			new WebSlider().init(element);
		});
	}($$('.web-slider'));
	// 总榜单导航
	$$('.rank-nav').forEach(function(element){
		$$('.rn-bd dl', element).forEach(function(element){
			$('dt', element).addEventListener('click', function(){
				var classList = element.classList;
				if (classList.contains('show')) {
					classList.remove('show');
				} else {
					classList.add('show');
				}
			}, false);
		});
	});
	// 文章页搜索栏
	$$('.hb-search').forEach(function(element){
		var input = $('.hb-kw input'),
			classList = element.classList;
		input.addEventListener('focus', function(){
			classList.add('cur');
		}, false);
		input.addEventListener('blur', function(){
			classList.remove('cur');
		}, false);
	});
	// 文章页问题
	$$('.question-section').forEach(function(element){
		var trigger = $('.qs-expand', element),
			triggerClassList = trigger.classList,
			describeClassList = $('.qs-describe', element).classList;
		trigger.addEventListener('click', function(){
			if (triggerClassList.contains('cur')) {
				triggerClassList.remove('cur');
				describeClassList.remove('cur');
			} else {
				triggerClassList.add('cur');
				describeClassList.add('cur');
			}
		}, false);
	});
}(document, window);