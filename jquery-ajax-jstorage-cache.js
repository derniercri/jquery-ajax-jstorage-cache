(function( $ ) {
  var log = function(message) {
    if ( window.console ) {
       console.debug( message );
    } else {
       alert( message );
    }
  };

  $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
    if( options.cacheJStorage  == undefined || ! options.cacheJStorage )
      return;

    var cacheKey;

    if ( options.cacheKey )
      cacheKey = options.cacheKey;
    else 
       cacheKey = options.url + options.type + options.data;
    
    if ( options.isCacheValid &&  ! options.isCacheValid() )
      $.jStorage.deleteKey( cacheKey );
    
    if ( $.jStorage.get( cacheKey ) ) {
      // Do not send a direct copy of Data
      var dataCached = $.extend(true, {}, $.jStorage.get( cacheKey ));

      if ( options.success )
        options.success( dataCached );

      // Abort is broken on JQ 1.5
      jqXHR.abort();
    }
    else {
      var successhandler = options.success,
        cacheTTL = options.cacheTTL;
      
      options.success = function( data ) {
        $.jStorage.set( cacheKey, data );

        if ( $.jStorage.setTTL ) {
          if ( cacheTTL )
            $.jStorage.setTTL( cacheKey, cacheTTL * 60 * 1000 );
        } 
        else
          log('Your jStorage version doesn\'t support TTL on key, please update jStorage ( http://www.jstorage.info/ )');

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