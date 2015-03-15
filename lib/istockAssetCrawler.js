var Q = require( 'q' );
var PhantomCrawler = require( './phantomCrawler.js' );

var IstockAssetCrawler = function () {
	this.__phantomCrawler = new PhantomCrawler();
};

module.exports = IstockAssetCrawler;


IstockAssetCrawler.prototype.collectData = function ( istockId ) {
	var assetCrawler = this;
	var deferred = Q.defer();

	assetCrawler.__phantomCrawler.openPage( 'http://deutsch.istockphoto.com/search/text/' + istockId ).then( function ( page, status ) {
		if ( status === 'fail' ) {
			// TODO log
			deferred.reject();
			return;
		}

		var assetData = {
			type: 'iStock',
			istockId: istockId
		};


		// **********************
		// Get the asset's name
		// **********************

		var namePromise = assetCrawler.__phantomCrawler.evaluateOnPage( page, function () {
			return document.getElementById( 'iSFileTitle' ).innerHTML.trim();
		} );

		namePromise.then( function ( result ) {
			assetData.name = result;
		} );


		// **********************
		// Get the asset's tags
		// **********************

		var tagsPromise = assetCrawler.__phantomCrawler.evaluateOnPage( page, function () {
			var keywordElements = document.querySelectorAll( '[itemprop=keywords]' );
			var keywords = [];

			for ( var i = 0; i < keywordElements.length; i++ ) {
				var keywordElement = keywordElements[ i ];
				var keyword = keywordElement.innerHTML;

				if ( keywords.indexOf( keyword ) == -1 ) {
					keywords.push( keyword );
				}
			}

			return keywords;
		} );

		tagsPromise.then( function ( result ) {
			assetData.tags = result;
		} );


		// **********************
		// Get the asset's thumbnailUrl
		// **********************

		var thumbnailUrlPromise = assetCrawler.__phantomCrawler.evaluateOnPage( page, function () {
			return document.getElementById( 'ZoomImage' ).src;
		} );

		thumbnailUrlPromise.then( function ( result ) {
			assetData.thumbnailUrl = result;
		} );

		var promises = [ namePromise, tagsPromise, thumbnailUrlPromise ];

		Q.allSettled( promises ).then( function ( results ) {
			assetCrawler.__phantomCrawler.stop();
		} );

		Q.all( promises ).then(
			function ( results ) {
				deferred.resolve( assetData );
			},
			function () {
				// TODO: log
				deferred.reject();
			}
		);
	} );

	return deferred.promise;
};
