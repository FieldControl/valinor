(function($) {

	var	$window = $(window),
		$body = $('body'),
		$document = $(document);


		breakpoints({
			desktop:   [ '737px',   null     ],
			wide:      [ '1201px',  null     ],
			narrow:    [ '737px',   '1200px' ],
			narrower:  [ '737px',   '1000px' ],
			mobile:    [ null,      '736px'  ]
		});


		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	
			$(
				'<div id="titleBar">' +
					'<a href="#sidebar" class="toggle"></a>' +
					'<span class="title">' + $('#logo').html() + '</span>' +
				'</div>'
			)
				.appendTo($body);


			$('#sidebar')
				.panel({
					delay: 500,
					hideOnClick: true,
					hideOnSwipe: true,
					resetScroll: true,
					resetForms: true,
					side: 'left',
					target: $body,
					visibleClass: 'sidebar-visible'
				});

})(jQuery);