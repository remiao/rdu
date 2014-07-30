/* 
	RDU 0.1
	Developed by Remi A Olsen, remi@remiandre.info. Grab it and use it if you so wish.
*/


var menuIdPrefix = "rdu-";				// ULs will show IDs of prefix+counter
var depthLimit = 0;						// How many menus should be shown behind the drop down button?
var widthShrinker = 2;					// For "3D effect", if depthLimit is higher than 0
var listSpacing = 1;					// Spacing between menus shown behind drop down button
var menuAnimationSpeed = 225;			// Drop down speed
var menuButtonAnimationSpeed = 110;		// Button click animation speed
var allowMultipleMenusOpen = 0;			// Set to 1 to allow multiple menus open
var zIndexStart = 1000;					// First z-index number. Set to higher if need be, but should be OK in most circumstances.
var keyPressClosesMenus = 1;			// Keyboard click closes menus

/* ######################################## Various HTML for customization ######################################## */
var rduSelectorIcon = "rduSelectorIcon";
var rduSelectorIconClose = "rduSelectorIconClose";
var rduSelectorIconSpan = "<span class=\"" + rduSelectorIcon + " fa fa-chevron-down\"></span>";
var rduSelectorIconSpanClose = "<span class=\"" + rduSelectorIconClose + " fa fa-times\"></span>";
var rduSelectorCounterSpan = "<span class=\"rduSelectorCounter\">0</span>";
var rdListButtonIconSpan = "<span class=\"rdListButtonIcon fa fa-circle-o\"></span>";
var rdListButtonIconSpanActive = "<span class=\"rdListButtonIcon fa fa-circle\"></span>";
var rduButtonSpan = "<span class=\"rduButtonIcon fa fa-circle-o\"></span>";
var rduButtonSpanActive = "<span class=\"rduButtonIcon fa fa-circle\"></span>";


/* *********** Menu Holder *********** */
var menus = new Array();
var menuCounter = 0;

function rdu(id,height,listItems,buttonHeight,selectorID,listType,open,counter,parentID,originalText,buttonText){
	this.id = id;
	this.height = height;
	this.listItems = listItems;
	this.buttonHeight = buttonHeight;
	this.selectorID = selectorID;
	this.listType = listType;
	this.open = open;
	this.counter = counter;
	this.parentID = parentID;
	this.originalText = originalText;
	this.buttonText = buttonText;
}

/* *********** Slide menus up and down *********** */
function animateMenu(id){
	var menu = menus[id];
	var list = $("#"+menu.id);
	var openMenu = menu.open == 0 ? 1 : 0;
	if(openMenu == 1) {
		var listItems = $(list.children("li").get().reverse());
		var listPosition = menu.height - menu.buttonHeight;
		var width = 100;
		var left = 0;
	} else {
		var listItems = $(list.children("li").get());
		var listPosition = 0 - menu.listItems[0] + listSpacing;
		var listPosition = depthLimit == 0 ? (0 - menu.buttonHeight) : (0 - menu.listItems[0] + listSpacing);
		var width = 100 - widthShrinker;
		var left = ((100 - (100 - widthShrinker)) / 2) + "%";
	}
	var listLimit = listPosition + (depthLimit * listSpacing) - listSpacing;
	$("#"+menu.selectorID).toggleClass("rduSelectorSelected");
	$("#"+menu.id).toggleClass("rduListSelected");
	$("#"+menu.selectorID).find(".rduSelectorIconClose").fadeToggle(menuButtonAnimationSpeed);
	listItems.each(
		function(){
			$(this).animate({
				    left: left,
				    width: width + "%",
				    top: listPosition
			},menuAnimationSpeed);
			if(openMenu == 1)
				listPosition = listPosition - parseInt($(this).css("height"));
			else {
				if(listPosition < listLimit)
					listPosition = listPosition + listSpacing;
				width = width - widthShrinker;
				left = (((2*parseInt(left)) + widthShrinker) / 2) + "%";
			}
		}
	);
	menu.open = openMenu;
}

/* *********** Close all menus marked as menu[x].open == 1 *********** */
function closeMenus(currentMenuId){
	$(".rduListSelected").each(
		function(index,value){
			var menu = $(this).attr("data-id");
 			if((menus[menu].open == 1) && (menu != currentMenuId)) animateMenu(menu);
		}
	);
}

/* *********** Draw out initial menu *********** */
function drawMenus(menu){
	var workMenu = $("#"+menu.id);
	var height = menu.height;
	var listItems = $(workMenu.children("li").get());
	var listPosition = depthLimit == 0 ? (0 - menu.buttonHeight) : (0 - menu.listItems[0] + listSpacing);
	var listLimit = listPosition + (depthLimit * listSpacing) - listSpacing;
	$("#"+menu.selectorID).css("zIndex",zIndexStart);
	zIndexStart--;
	var zIndexCounter = zIndexStart;
	var listWidth = 100 - widthShrinker;
	listItems.each(
		function(){
			$(this).css({
			    top: listPosition,
				width: listWidth+"%",
				zIndex: zIndexCounter,
				left: ((100-listWidth) / 2)+"%"
			}).children("a").append(rdListButtonIconSpan);
			if(listPosition < listLimit)
				listPosition = listPosition + listSpacing;
			zIndexCounter--;
			zIndexStart--;
			listWidth = listWidth - widthShrinker;
		}
	).promise().done(function(){workMenu.toggle();});
}

/* *********** Set up menus into an array, and add appropriate classes *********** */

function setUpDropDown(menu,listType){
	var menuButton = menu.children(".rduSelector")
	var buttonText = menuButton.text();
	var buttonHeight = parseInt(menuButton.css("height"));
	var selectorID = menuIdPrefix+"button-"+menuCounter;
	var height = 0;
	var originalText = new Array();
	var menuList = menu.children(".rduList");
	menuList.attr("id", menuIdPrefix+menuCounter);
	menuList.attr("data-id", menuCounter);
	menuButton.attr("id",selectorID);
	menuButton.children("a").append(rduSelectorIconSpan);
	menuButton.children("a").append(rduSelectorIconSpanClose);
	menuButton.children("a").append(rduSelectorCounterSpan);
	var listItems = $(menuList.children("li").get().reverse());
	var listArray = new Array();
	var listCounter = 0;
	listItems.each(
		function(){
			originalText.push($(this).children("a").html());
			listArray.push(parseInt($(this).css("height")));
			height += parseInt($(this).css("height"));
			$(this).children("a").attr("data-counter", listCounter);
			$(this).children("a").attr("id", menuIdPrefix+menuCounter+"-"+listCounter);
			listCounter++;
		}
	).promise().done(function(){
			menus.push(new rdu(menuList.attr("id"),height,listArray,buttonHeight,selectorID,listType,0,0,menu.attr("id"),originalText,buttonText));
			drawMenus(menus[menuCounter]);
			menuCounter++;
		}
	);
}

function setUpButton(menu,listType){
	var buttonLink = menu.children("a");
	var id = menuIdPrefix+menuCounter;
	buttonLink.append(rduButtonSpan);
	buttonLink.attr("id", id);
	buttonLink.attr("data-id", menuCounter);
	menuCounter++;
}

function setUpMainMenu(menu){
	var multipleChoices = 0;
	var activeMenu = "rduMainMenuSelected";
	var showActiveMenu = 1;
	var allowNoChoices = 0;
	if( ($(menu).attr("data-list-multiple") != undefined) && ($(menu).attr("data-list-multiple") == "1") ) {
		multipleChoices = 1;
		activeMenu = "rduMainMenuMultipleSelected";
	}
	if( ($(menu).attr("data-active-buttons") != undefined) && ($(menu).attr("data-active-buttons") == "0") )
		showActiveMenu = 0;
	if( ($(menu).attr("data-list-no-choices") != undefined) && ($(menu).attr("data-list-no-choices") == "1") )		
		allowNoChoices = 1;		
	if(showActiveMenu == 1)
		$(menu).find("a").each(
			function(){
				$(this).mousedown(
					function(){
						if( $(this).hasClass(activeMenu) )
							$(this).removeClass(activeMenu);
						else {
							if( multipleChoices == 0 ) $(this).parents().eq(2).find("a").removeClass(activeMenu);
							if(allowNoChoices == 0)
								$(this).toggleClass(activeMenu);
							else
								$(this).addClass(activeMenu);
						}
					}
				);
			}
		);
}

function setUpMenus(menu,listType){
	var listType = "multilist"; 
	if( (menu.attr("data-list-type") != undefined) && (menu.attr("data-list-type") != "multilist") )
		listType = menu.attr("data-list-type");
	switch(listType) {
		case "button" :
			setUpButton(menu,listType);
			break;
		case "multilist" :
		case "singlelist" :
			setUpDropDown(menu,listType);
			break;
		case "mainmenu" :
			setUpMainMenu(menu);
			break;
	}
}

/* *********** Menu selections *********** */

function checkUncheck(link, from, to, type){
	var text = link.html();	
	text = text.replace(from, to);
	link.html(text);
	if(type == "single")
		$("#" + link.attr("id")).parents().eq(1).children("li").removeClass("rduSelectedElement");
	$("#" + link.attr("id")).parent().toggleClass("rduSelectedElement")
}


function multipleOptions(link,menu){
	var text = link.html();
	var activateOption = text.indexOf(rdListButtonIconSpan) > 0 ? 1 : 0;
	var oldCounter = menu.counter;
	var counterSpan = $("#"+menu.parentID + " a .rduSelectorCounter");
	if(activateOption == 1) {
		checkUncheck(link, rdListButtonIconSpan, rdListButtonIconSpanActive, "multiple");
	 	if(menu.counter == 0)
	 		counterSpan.slideDown(20);
		menu.counter++;
	} else {
		checkUncheck(link, rdListButtonIconSpanActive, rdListButtonIconSpan, "multiple");
		menu.counter--;
	 	if(menu.counter == 0)
	 		counterSpan.slideUp(20);

	}
 	counterSpan.text(menu.counter); 
}


function singleOption(link,menu){
	var defaultText = menu.buttonText + rduSelectorIconSpan;
	var changeToText = menu.originalText[link.attr("data-counter")] + rduSelectorIconSpan;
	var changeFromText = $("#" + menu.selectorID).children("a").html();
	var listMenu = $("#" + menu.id)
	var listButton = $("#" + menu.selectorID)
	listMenu.children("li").each(
		function(){
			var linkCheck = $(this).children("a");
			if(linkCheck.html().indexOf(rdListButtonIconSpanActive) > -1) {
				var text = linkCheck.html();
				text = text.replace(rdListButtonIconSpanActive, rdListButtonIconSpan);
				linkCheck.html(text);
			}
		}
	).promise().done(
		function(){
			if(changeToText == changeFromText) {
				listButton.children("a").html(defaultText)
				checkUncheck(link, rdListButtonIconSpanActive, rdListButtonIconSpan, "single");
			} else {
				listButton.children("a").html(changeToText);
				checkUncheck(link, rdListButtonIconSpan, rdListButtonIconSpanActive, "single");
			}
			animateMenu(listMenu.attr("data-id"));
		}
	);
}

function buttonOption(link){
	if(link.html().indexOf(rduButtonSpan) > -1)
		checkUncheck(link, rduButtonSpan, rduButtonSpanActive, "button");
	else
		checkUncheck(link, rduButtonSpanActive, rduButtonSpan, "button");
}

$(window).load(
	function(){
	
		$(".rdu").each(
			function(){
				setUpMenus($(this));
			}
		);
		
		$(".rduSelector a").mousedown(
			function(){
				var currentMenuId = $(this).parents().eq(1).children(".rduList").attr("data-id");
				if(allowMultipleMenusOpen == 0) closeMenus(currentMenuId);
				animateMenu(currentMenuId);
			}
		);
		
		
		$(".rduList a").mousedown(
			function(){
				var menu = menus[$(this).parents().eq(1).attr("data-id")];
				if($("#" + menu.id).attr("class").indexOf("rduListSelected") > -1)
					menu.listType == "multilist" ? multipleOptions($(this),menu) : singleOption($(this),menu);
			}
		);
		
		$(".rduButton a").mousedown(
			function(){
				buttonOption($(this));
			}
		);
		
		$(document).click(
			function(event){
				if ( (!$(event.target).is(".rdu *")) || ($(event.target).is(".rduButton *")) )
					closeMenus(null);
			}
		);
		
		if(keyPressClosesMenus == 1)
			$(document).keydown(
				function(event){
					closeMenus(null);
				}
			);
	}
);