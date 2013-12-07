function isTouchDevice() {
	var el = document.createElement('div');
	el.setAttribute('ongesturestart', 'return;');
	if(typeof el.ongesturestart == "function"){
		return true;
	} else {
		return false
	}
}

touchControls = {
	
	init : function( opt )
	{
	
		// only floating layouts
		if ($('deadcenter').getStyle('position') != 'absolute') {
			return;
		}
		
		// only touch capable
		if (!isTouchDevice()) {
			return;
		}
		
		window.document.addEventListener("touchstart", this.touchStart.bind( this ), false);
		window.document.addEventListener("touchmove", this.touchMove.bind( this ), false);
		window.document.addEventListener("touchend", this.touchEnd.bind( this ), false);
		window.document.addEventListener("touchcancel", this.touchCancel.bind( this ), false);
		window.document.addEventListener("webkitTransitionEnd", this.transEnd.bind( this ), false );
	},
	
	stopListening : function()
	{
		this.stop = true;
	},
	
	startListening : function()
	{
		this.stop = false;
	},
	
	
	transEnd : function( e )
	{
		this.isAnimating = false;
		this.options.target.setStyles({
			'-webkit-transition-duration' : 'none',
			'-webkit-transition-property' : 'none'
		});
		if( this.lastPage != this.currentPage )
		{
			this.fireEvent( 'willDisplay', {
				current : this.currentPage
			});
			this.fireEvent( 'pageChange', { current : this.currentPage, last : this.lastPage } );			
		}
	},
	
	touchStart : function( e )
	{
		if( this.isAnimating || this.stop )
		{
			return false;
		}
		this.options.target.setStyles({
			'-webkit-transition-duration' : 'none',
			'-webkit-transition-property' : 'none'
		});
		this.hasFiredRedraw = false;
		this.startTime = new Date();
		this.currentTranslate = this.get3DTranslate();
		this.currentX = e.targetTouches[0].pageX;
		this.startTouchX = e.targetTouches[0].pageX;
		this.startTouchXX = e.touches[0].pageX;
		this.endTouchX = this.startTouchXX;
		e.preventDefault();
	},
	
	touchMove : function( e, flag )
	{
		if( ( this.isAnimating || this.stop ) && !flag )
		{
			return false;
		}
		var newTransX;
		if( !flag )
		{
			this.endTouchX = e.touches[0].pageX;
			var curX = ( this.currentTranslate ? this.currentTranslate.x : 0 );			
			newTransX = e.targetTouches[0].pageX - ( this.currentX - curX );			
		} else {
			this.endTouchX = e.touches[0].pageX;
			var curX = ( this.currentTranslate ? this.currentTranslate.x : 0 );
			newTransX = e.touches[0].pageX - ( this.currentX - curX );
		}
		this.distanceTravelled = Math.abs( this.startTouchXX - this.endTouchX );
		
		if( this.distanceTravelled > 0 && !this.hasFiredRedraw )
		{
			this.fireEvent( 'willDisplay', {
				current : this.currentPage
			});
			this.hasFiredRedraw = true;
		}
		
		this.options.target.setStyle( '-webkit-transform', 'translate3d(' + newTransX + 'px,0,0)' );
		
		e.preventDefault();
	},
	
	touchEnd : function( e )
	{
		if( this.isAnimating || this.stop )
		{
			return false;
		}
		this.endTime = new Date();
		
		var tapVal = this.endTouchX;
		
		if( isNaN( tapVal ) || Math.abs( this.startTouchXX - this.endTouchX ) < 50 )
		{
			return;
		}
		
		if( ( this.endTime - this.startTime ) < 200 )
		{
			if( this.endTouchX > this.startTouchX )
			{
				this.goBack();
			} else {
				this.goForward();
			}
			return;
		}
				
		var newX = this.get3DTranslate().x;		
		var a = ( ( this.currentPage + 1 ) * window.getSize().x ) + newX;
		if( this.distanceTravelled < ( window.getSize().x / 2 ) )
		{
			this.gotoPage( this.currentPage );
			e.preventDefault();
			return false;
		}
		if( a > ( window.getSize().x / 2 ) )
		{
			this.goBack();
		} else {
			this.goForward();
		}
		e.preventDefault();
	},
	
	touchCancel : function( e )
	{
		if( this.isAnimating )
		{
			return false;
		}
		e.preventDefault();
	}
	
};


window.addEvent('domready', function() {

	touchControls.init();

})