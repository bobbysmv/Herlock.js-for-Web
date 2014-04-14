define([
    "lib/Class"
],function( Class ){

    var Tile = {
        create: function( texture ){
            return {
                texture: texture,
                index: -1,
                offsetX: 0,
                offsetY: 0,
                /** 需要 0〜1 */
//                demand: -1,
                setDemand: setDemand,
                /** 利用クライアント */
                client: null,
                reset: reset
            };
        }
    };
    function setDemand( value ){
        this.texture._setTileDemand( this.offsetX, this.offsetY, value );
    }
    function reset() {
        this.setDemand( 0 );
        this.client = null;
    }

    return Tile;
});