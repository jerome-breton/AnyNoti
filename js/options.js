$(function(){
	$.hurl({monitor:true});
	$('#navbar li').click(function(){
		$.hurl('update',{"page":$(this).attr('pagename')});
	});
	$('body').bind('hurl',function(event){
		showPage( $("body").data("hurl").link.page );
	});
	$.hurl('update',{"page":$('#navbar li').first().attr('pagename')});
});



function showPage(pagename){
	$('#'+($('#navbar li.navbar-item-selected')	.toggleClass('navbar-item-selected').attr('pagename'))+'Page').hide();
	$('#'+($('#'+pagename+'PageNav')			.toggleClass('navbar-item-selected').attr('pagename'))+'Page').show();
}