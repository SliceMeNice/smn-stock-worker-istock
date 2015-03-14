var Q = require( 'q' );

var Stock = function ( stockApiClient ) {
	this.__stockApiClient = stockApiClient;
};

module.exports = function ( config ) {
	var StockApiClient = require( './stockApiClient.js' )( config );
	var stockApiClient = new StockApiClient();

	return new Stock( stockApiClient );
};

// ****************
// Implementation
// ****************

Stock.prototype.addTagToAsset = function ( tag, asset ) {
	var stock = this;
	var deferred = Q.defer();

	stock.__stockApiClient.addTagToAsset( tag, asset )
		.on( 'success', function ( data, response ) {
			deferred.resolve();
		} )
		.on( 'fail', function ( data, response ) {
			deferred.reject( response );
		} )
		.on( 'error', function ( error, response ) {
			console.log( error );
		} );

	return deferred.promise;
};

Stock.prototype.createAsset = function ( assetData ) {
	var stock = this;
	var deferred = Q.defer();

	stock.__stockApiClient.createAsset( assetData )
		.on( 'success', function ( asset, response ) {
			deferred.resolve( asset );
		} )
		.on( 'fail', function ( data, response ) {
			deferred.reject( response );
		} )
		.on( 'error', function ( error, response ) {
			console.log( error );
		} );

	return deferred.promise;
};

Stock.prototype.createTag = function ( tagName ) {
	var stock = this;
	var deferred = Q.defer();

	stock.__stockApiClient.createTag( tagName )
		.on( 'success', function ( tag, response ) {
			deferred.resolve( tag );
		} )
		.on( 'fail', function ( data, response ) {
			deferred.reject( response );
		} )
		.on( 'error', function ( error, response ) {
			console.log( error );
		} );

	return deferred.promise;
};

Stock.prototype.findAsset = function ( assetData ) {
	var stock = this;
	var deferred = Q.defer();

	stock.__stockApiClient.findAssetByIstockId( assetData.istockId )
		.on( 'success', function ( asset, response ) {
			deferred.resolve( asset );
		} )
		.on( 'fail', function ( data, response ) {
			deferred.reject( response );
		} )
		.on( 'error', function ( error, response ) {
			console.log( error );
		} );

	return deferred.promise;
};

Stock.prototype.findTagByName = function ( tagName ) {
	var stock = this;
	var deferred = Q.defer();

	stock.__stockApiClient.findTagByName( tagName )
		.on( 'success', function ( tag, response ) {
			deferred.resolve( tag );
		} )
		.on( 'fail', function ( data, response ) {
			deferred.reject( response );
		} )
		.on( 'error', function ( error, response ) {
			console.log( error );
		} );

	return deferred.promise;
};

Stock.prototype.findOrCreateAsset = function ( assetData ) {
	var stock = this;
	var deferred = Q.defer();

	stock.findAsset( assetData ).then(
		function ( asset ) {
			deferred.resolve( asset );
		},
		function ( response ) {
			switch ( response.statusCode ) {
				case 404:
					stock.createAsset( assetData ).then(
						function ( newAsset ) {
							deferred.resolve( newAsset );
						},
						function ( response ) {
							// TODO: log
							deferred.reject( response );
						}
					);
					break;

				default:
					// TODO: log
					deferred.reject( response );
			}
		}
	);

	return deferred.promise;
};

Stock.prototype.findOrCreateTag = function ( tagName ) {
	var stock = this;
	var deferred = Q.defer();

	stock.findTagByName( tagName ).then(
		function ( tag ) {
			deferred.resolve( tag );
		},
		function ( response ) {
			switch ( response.statusCode ) {
				case 404:
					stock.createTag( tagName ).then(
						function ( newTag ) {
							deferred.resolve( newTag );
						},
						function ( response ) {
							// TODO: log
							deferred.reject( response );
						}
					);
					break;

				default:
					// TODO: log
					deferred.reject( response );
			}
		}
	);

	return deferred.promise;
};
