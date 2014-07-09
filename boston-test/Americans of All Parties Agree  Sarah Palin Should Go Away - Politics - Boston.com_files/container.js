//alert the csprt iframe of an orientation change event
window.onorientationchange = function() {
	
	//landscape vs portrait
	var event_message = '';
	if (window.innerWidth > window.innerHeight)
		event_message = 'onorientationchange_landscape';
	if (window.innerWidth < window.innerHeight)
		event_message = 'onorientationchange_portrait';

	var inline_iframe = document.getElementById('inline-csprt');
	if (inline_iframe) {
		inline_iframe.contentWindow.postMessage(event_message,inline_iframe.src);
	}
	var rail_iframe = document.getElementById('rail-csprt');
	if (rail_iframe) {
		rail_iframe.contentWindow.postMessage(event_message,rail_iframe.src);
	}
}

