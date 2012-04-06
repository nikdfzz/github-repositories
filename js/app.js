window.App = {

	/**
	 * Init
	 */
	init: function(){
		Authentication.validate( function(user) {
			User.init(user);	
			Content.init();
			Navigation.init();
			Settings.init();
			Switcher.init();

			// Update notifications.
			Socket.postMessage({
				namespace: "window",
				literal: "Notifier",
				method: "update"
			});

			App.bind();
			App.show();

		}, function() {
			Authentication.prompt();
		});
	},

	/**
	 * Bind
	 */
	bind: function() {

		// Bind user link tooltips hover events.
		jQuery('.user_links [tooltip]').each( function() {
			var element = jQuery(this);
			var html = "<span class='tooltip'>"
			         + "<span class='arrow'></span>"
					 + "<span class='bubble'>" + element.attr('tooltip') + "</span>"
					 + "</span>";
			jQuery(this).append(html);
			element.on('hover', function() {
				element.find('.tooltip').fadeToggle(75);
				var bubble = element.find('.bubble');
				bubble.css('margin-left', -bubble.width() / 2 + "px");
			});
		});

		// Bind notification click events.
		jQuery('.user_links li[rel="notifications"]').on('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			jQuery('<div id="notifications"/>').load('https://github.com/inbox/notifications #inbox .item', function() {
			  jQuery('[rel="notifications"]').append(this);
			});
      // window.open("https://github.com/inbox/notifications", '_blank');
		});

		// Bind logout click event.
		jQuery('.user_links li[rel="log_out"]').on('click', function() {
			Storage.clear();
			
			// Remove notifications.
			Socket.postMessage({
				namespace: "window",
				literal: "Notifier",
				method: "update"
			});
			App.close();
		});

		// Bind refresh button click event and mouse events.
		var refresh = jQuery('.refresh');
		refresh.on('click', function() {
			window[Navigation.selected].load.refresh(User.context, Navigation.selected);
		});
		refresh.on('mousedown', function() {
			refresh.addClass('down');
		});
		refresh.on('mouseup', function() {
			refresh.removeClass('down');
		});
		refresh.on('mouseleave', function() {
			refresh.removeClass('down');
		});
	},

	/**
	 * Close
	 * 
	 * Close extension popup/window.
	 */
	close: function(){
		window.close();
		chrome.tabs.getCurrent(function(tab) {
			chrome.tabs.remove(tab.id, function(){});
		});
	},
	
	/**
	 * Show
	 * 
	 * Show the extension application.
	 */
	show: function() {
		jQuery('body').removeClass('loading').find('#application').show();
	},

	/**
	 * Update
	 */
	update: {
	
		/**
		 * Notifications
		 * 
		 * Update notifications count (user must also be logged into GitHub).
		 * 
		 * @param count Number of notifications the user currently has.
		 */
		notifications: function(count) {
			var notifications = jQuery('.user_links li[rel="notifications"]');
			var unread = notifications.find('.unread');

			if(count !== '') {
				if(unread.length > 0) {
					unread.empty();
					unread.prepend(count);
				}
				else {
				 	unread = "<span class='unread'>" + count + "</span>";
					notifications.prepend(unread);
				}
			}
			else {
				if(unread.length > 0) {
					unread.remove();
				}
			}
		}
	}
};

// Prevent any future conflicts.
$.noConflict();

// Initialize application after page has loaded.
jQuery(window).bind("load", function() {
	
	// Kill the extension if local storage is not supported.
	if(!Storage.isSupported()) {
		App.close();
	}
	else {
		App.init();
	}
});