
(function($) {

	var debounce = function(func, waitTime) {
			var timeout = false;
			return function() {
				if (timeout === false) {
					setTimeout(function() {
						func();
						timeout = false;
					}, waitTime);
					timeout = true;
				}
			};
		},
		closeToc = function() {
			$(".toc-wrapper").removeClass('open');
			$("#nav-button").removeClass('open');
		};

	window.lumise_doc = {

		loaded : false,

		header_pos : {},

		init : function (){

			lumise_doc.render_toc();

			$("#nav-button").click(function() {
				$(".toc-wrapper").toggleClass('open');
				$("#nav-button").toggleClass('open');
				return false;
			});
			$(".page-wrapper").click(closeToc);
			$(".toc-link").click(closeToc);

			$(window).scroll(debounce(lumise_doc.sync_pos, 200));
			$(window).resize(debounce(lumise_doc.render_toc, 200));
		},

		render_toc : function (){
			var tocs = {},
				html = '<ul>',
				parent_tags = ['H1', 'H2', 'H3'],
				parents = {},
				child = [],
				parent = null,
				get_childs = function (parent, node){
					var html = '';

					for(var i in tocs){
						if(tocs[i].parent == parent){
							var node = tocs[i].node.toLowerCase(),
								child = get_childs(tocs[i].slug, node);
							html += '<li><a href="#'+tocs[i].slug+'" class="toc-'+node+' toc-link '+((child !== '')? 'toc-has-child' : '')+'" data-title="'+tocs[i].title+'">'+tocs[i].title+'</a>';
							if(child !== ''){
								html += '<ul class="toc-list toc-list-'+node+'">' +child+ '</ul>';
							}
							html += '</li>';
						}
					}
					return html;
				};

			$('.page-wrapper .content h1, .page-wrapper .content h2, .page-wrapper .content h3').each(function (ind){
				
				var node = this.nodeName,
					toc = $(this).html(),
					toc_slug = $(this).attr('id'),
					toc_level = parent_tags.indexOf(node),
					last_parent;

				if(typeof toc_slug !== 'undefined'){

					if(typeof parents[toc_level - 1] !== 'undefined')
						last_parent = parents[toc_level - 1];

					tocs[toc_slug] = {
						slug : toc_slug,
						title : toc.replace('Lumise', ''),
						level : toc_level,
						node : this.nodeName,
						childs : [],
						parent : (typeof last_parent === 'string') ? last_parent : ''
					};

					if(
						toc_level > -1
					){
						parents[toc_level] = toc_slug;
					}

				}
			});

			html += get_childs('', 'h1');
			html += '</ul>';

			$('#toc').html(html);

			
			lumise_doc.sync_pos();
			lumise_doc.repos();

		},

		sync_pos : function (){
			var current = $(document).scrollTop() + 10,
				pheight = $(document).height(),
				wheight = $(window).height(),
				active_toc, active_slug,
				org_title = document.title,
				max_toc= 0,
				wrp_toc = $('#toc');

			if (current + wheight >= pheight) {
				current = pheight + 0;
			}

			for (var toc in lumise_doc.header_pos) {
				if (
					(
						lumise_doc.header_pos[toc] < current && 
						max_toc < lumise_doc.header_pos[toc]
					) || 
					active_slug === null
				) {
					active_slug = toc;
					max_toc = lumise_doc.header_pos[toc];
				}
			}

			if (current == 10) {
				active_slug = window.location.hash;
				//loaded = true;
			}

			active_toc = $('#toc').find("[href='" + active_slug + "']").first();

			if (active_toc.length) {
				wrp_toc.find(".active").removeClass("active");
				wrp_toc.find(".active-parent").removeClass("active-parent");

				active_toc.addClass("active");
				active_toc.parents('ul.toc-list').addClass("active").siblings('.toc-link').addClass('active-parent');

				active_toc.siblings('ul.toc-list').addClass("active");

				wrp_toc.find('ul.toc-list').filter(":not(.active)").slideUp(150);
				wrp_toc.find('ul.toc-list').filter(".active").slideDown(150);

				if (window.history.pushState) {
					window.history.pushState(null, "", active_slug);
				}
				
				var title = active_toc.data("title");
				document.title = (( title !== 'undefined')? title : '') + ' - ' + org_title;
			}

		},

		repos : function (){
			lumise_doc.header_pos = {};

			$('#toc a').each(function (ind){
				var target = $(this).attr('href');
				if (target[0] === "#" && $(target).get(0)) {
					lumise_doc.header_pos[target] = $(target).offset().top;
				}
			});
		}

	}
	$( document ).ready(function() {
		lumise_doc.init();
	});
})(jQuery);
