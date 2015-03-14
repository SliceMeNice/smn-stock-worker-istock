var rest = require( 'restler' );

module.exports = function ( config ) {

	return StockApiClient = rest.service(
		function () {
			// constructor
		},
		{
			baseURL: config.get( 'STOCK_API_BASE_URL' )
		},
		{
			addTagToAsset: function ( tag, asset ) {
				var url = 'Assets/' + asset.id + '/tags/rel/' + tag.id;
				return this.put( url );
			},

			createAsset: function ( assetData ) {
				var url = 'Assets';
				return this.post( url, { data: { name: assetData.name, istockId: assetData.istockId } } )
			},

			createTag: function ( tagName ) {
				var url = 'Tags';
				return this.post( url, { data: { name: tagName } } )
			},

			findAssetByIstockId: function ( istockId ) {
				var url = 'Assets/findOne?filter[where][istockId]=' + istockId;
				return this.get( url );
			},

			findTagByName: function ( tagName ) {
				var url = 'Tags/findOne?filter[where][name]=' + tagName;
				return this.get( url );
			}
		}
	);

};
