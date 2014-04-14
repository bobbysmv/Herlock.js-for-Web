define([
    "lib/mini"
],function( mini ){

    var User = function(){
        mini.User.apply( this, arguments );
    };

    User.prototype = Object.create( mini.User.prototype ,{

        compareScore: { value: function( a, b ){ return a >= b; } },

        /**
         * コレクションを付与
         */
        grantCollection: { value: function( name ){
            if( !this._data.collections ) this._data.collections = {};
            this._data.collections[name] = true;
            this._save();
        } },
        hasCollection: { value: function( name ){
            if( !this._data.collections ) this._data.collections = {};
            return !!this._data.collections[name];
        } },

        /**
         * 勲章を付与
         */
        grantMedal: { value: function( name ){
            if( !this._data.medals ) this._data.medals = {};
            this._data.medals[name] = true;
            this._save();
        } },
        hasMedal: { value: function( name ){
            if( !this._data.medals ) this._data.medals = {};
            return !!this._data.medals[name];
        } },

        /**
         *
         */
        playCount: { get: function(){ return this._data.hasOwnProperty("playCount")? this._data.playCount: 0; },
            set: function( value ){
                this._data.playCount = value;
                this._save();
            }
        },

        /**
         * キャラ選択
         */
        activeCharaId: {
            get: function(){ return this._data.activeCharaId || "normal"; },
            set: function( name ){
                this._data.activeCharaId = name;
                this._save();
            }
        }

    });

    return User;
});