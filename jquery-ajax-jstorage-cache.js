(function( $ ) {
  var log = function(message) {
    if ( window.console ) {
       console.debug( message );
    } else {
       alert( message );
    }
  };

  $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
    // Cache it ?
    if( options.cacheJStorage  == undefined || ! options.cacheJStorage )
      return;

    var cacheKey;
    // If cacheKey exists we take it, or default one will be used
    if ( options.cacheKey )
      cacheKey = options.cacheKey;
    else 
       cacheKey = options.url + options.type + options.data;
    
    // isCacheValid is a function to validate cache
    if ( options.isCacheValid &&  ! options.isCacheValid() )
      $.jStorage.deleteKey( cacheKey );
    
    if ( $.jStorage.get( cacheKey ) ) {
      // Do not send a direct copy of Data
      var dataCached = $.extend(true, {}, $.jStorage.get( cacheKey ));

      // In the cache? So get it, apply success callback & abort the XHR request
      if ( options.success )
        options.success( dataCached );

      // Abort is broken on JQ 1.5 :(
      jqXHR.abort();
    }
    else {
      //If it not in the cache, we change the success callback, just put data on jStorage and after that apply the initial callback
      var successhandler = options.success;
      
      options.success = function( data ) {
        $.jStorage.set( cacheKey, data );

        // Send a deep clone of data
        var dataCached = $.extend(true, {}, data );
        
        if ( successhandler )
          successhandler( dataCached );

        // Don't execute this success callback again
        options.success = successhandler;
      }
    }
  });
})( jQuery );