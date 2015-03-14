var path = require( 'path' );
var phantom = require( 'phantom' );
var Q = require( 'q' );

var PhantomCrawler = function () {
	this.__phantom = null;
};

module.exports = PhantomCrawler;


// ****************
// Public Methods
// ****************

PhantomCrawler.prototype.evaluateOnPage = function ( page, evaluate ) {
	var deferred = Q.defer();

	var args = Array.prototype.slice.call( arguments, 2 );
	args.unshift( evaluate, function ( result ) {
		deferred.resolve( result );
	} );

	page.evaluate.apply( this, args );

	return deferred.promise;
};

PhantomCrawler.prototype.openPage = function ( url ) {
	var crawler = this;
	var deferred = Q.defer();

	crawler.__createPhantom().then(
		function ( phantom ) {
			crawler.__createPage( phantom ).then(
				function ( page ) {

					page.open( url, function ( status ) {
						deferred.resolve( page, status );
					} );

				},
				function ( error ) {
					// TODO: log
					deferred.reject( error );
				}
			);
		},
		function () {
			// TODO: log
			deferred.reject();
		}
	);

	return deferred.promise;
};

PhantomCrawler.prototype.stop = function () {
	var crawler = this;

	if ( crawler.__phantom ) {
		crawler.__phantom.exit();
		crawler.__phantom = null;
	}
};


// ****************
// Private Methods
// ****************

PhantomCrawler.prototype.__createPage = function ( phantom ) {
	var deferred = Q.defer();

	phantom.createPage( function ( page, error ) {
		if ( error ) {
			// TODO: log
			deferred.reject( error );
		} else {
			deferred.resolve( page );
		}
	} );

	return deferred.promise;
};

PhantomCrawler.prototype.__createPhantom = function () {
	var crawler = this;
	var deferred = Q.defer();

	if ( crawler.__phantom ) {
		deferred.resolve( this.__phantom );
	} else {
		var options = {
			path: path.join( './', 'node_modules/phantomjs/bin/' )
		};

		phantom.create( function ( phantom ) {
			crawler.__phantom = phantom;
			deferred.resolve( phantom );
		}, options );
	}

	return deferred.promise;
};