/**
 * Prototypeベースのクラス定義。
 * 関数の参照引き回しにprototypeを用いる。
 * プロパティは
 * ・コンストラクター内定義
 * ・クラスへ定義
 * どちらでも可能なように調整。
 * 定義方法はNonProtoと全く同じで済むように。ただし、ルートクラスはObjectに限る
 *
 *
 * 裏でやってること
 * (function( parent ){
 *
 * parent.constructor;
 * parent.setupProperties;
 * parent.prototype = {  };
 *
 * var Cls = function(){
 *      setupProperties.call(this);
 *      constructor.call(this);
 * };
 *
 * // call constructor
 * var constructor = function( arg ){
 *     parent.constructor.call( this, arg );
 * };
 *
 * // setup functions
 * Cls.prototype = Object.create( parent.prototype );
 * Cls.prototype.getName = {
 *     return parent.prototype.getName.call( this );
 * };
 *
 * // setup properties
 * var properties = {
 *     key: { get: function(){ return "value"; } }
 * };
 * var setupProperties = function(){
 *     parent.setupProperties.call( this, arg );
 *     Object.defineProperties( this, properties );
 * };
 *
 * });
 *
 * 　↓↓↓
 *
 * var Cls = new Class( Parent, function( cls, parent ){
 *
 *     cls.constructor = function( arg ){
 *         parent.constructor.call(this, arg);
 *     };
 *
 *     cls.key = { get: function(){ return "value"; } };
 *
 *     cls.getName = function(){
 *         return parent.getName.call(this);
 *     }
 *
 * } );
 *
 *
 *
 */
(function(){

    /**
     * クラス定義リスト
     * @type {Array}
     */
    var ClassList = [];
    ClassList.register = function( cls ){
        cls.id = this.push( cls )-1;
    }
    ClassList.has = function( cls ){
        return this.indexOf( cls ) !== -1;
    };
    ClassList.getById = function( id ){
        return this[ id ];
    };


    /**
     * クラス定義クラス
     */
    var ClassDefinition = function() {
        this.id = -1;
        this.parent = null;
        this.isExternal = false;

        Object.defineProperties( this, {
            root:{ get: function() { return this.isExternal ? this : this.parent.root; } }
        } );

        ClassList.register( this );
    };
    ClassDefinition.prototype = { };

    ClassDefinition.prototype.getPrototypeObject = function(){ return {} };


    /**
     * 外部クラス定義ラップクラス
     */
    var ExternalClassDefinition = function( externalClassConstructor ){
        ClassDefinition.call(this);
        this.isExternal = true;
        /**
         * 外部クラスのコンストラクター参照
         * @type {Function}
         * @private
         */
        this.externalClassConstructor = externalClassConstructor;

    };
    ExternalClassDefinition.prototype = Object.create( ClassDefinition.prototype );

    ExternalClassDefinition.prototype.getProto = function(){
        var proto = Object.create( this.externalClassConstructor.prototype,
            { constructor: {value:this.externalClassConstructor} } );
        return proto;
    };


    /**
     * カスタムクラス定義クラス
     */
    var CustomClassDefinition = function(){
        ClassDefinition.call(this);
        this.isExternal = false;

        this._implementation = null;
    };
    CustomClassDefinition.prototype = new ClassDefinition();

    CustomClassDefinition.prototype.getProto = function(){
        return this._proto;
    };

    CustomClassDefinition.prototype.inherit = function( parentClass ) {
        if( parentClass.id && ClassList.getById( parentClass.id ) )
            this.parent = ClassList.getById( parentClass.id );
        else
            this.parent = new ExternalClassDefinition( parentClass );

        this._inheritList = [];
        var curr = this;
        while( curr ) {
            this._inheritList.unshift( curr );
            curr = curr.parent;
        }
    };

    CustomClassDefinition.prototype.implement = function( implementation ) {
        this._implementation = implementation;

        var parentProto = this.parent.getProto();

        // 実行
        var cls = {};
        this._implementation( cls, parentProto );


        var proto = {};
        var properties = {};

        for( var key in cls ) {
            var value = cls[key];
            if( typeof value === "function" )// func
                proto[key] = value;
            else { // prop
                // TODO getter,setterの場合,prototypeに付与してしまうかインスタンス毎に付与するか？prototypeのほうが生成コスト格段にいいが.

                //properties[key] = value;

                // prototype利用のパターン↓
                if( value && value.get && typeof value.get === "function" ) { // getter,setter
                    value.configurable = ("configurable" in value) ? value.configurable : true;
                    value.enumerable = ("enumerable" in value) ? value.enumerable : true;
                    Object.defineProperty( proto, key, value );
                } else // property
                    properties[key] = value;
            }
        }

        //
        var parentSetupProperties = this.parent && this.parent.setupProperties ? this.parent.setupProperties : function(){};
        this.setupProperties = function() {
            parentSetupProperties.call( this );
            for( var key in properties ) {
                var value = properties[key];

                this[key] = value;

                /*
                if( value && value.get && typeof value.get === "function" ) { // getter,setter
                    value.configurable = ("configurable" in value) ? value.configurable : true;
                    value.enumerable = ("enumerable" in value) ? value.enumerable : true;
                    Object.defineProperty( this, key, value );
                } else // property
                    this[key] = value;
                */
            }
        }

        proto.__proto__ = parentProto;
        this._proto = proto;

        this.constructor = proto.constructor;// || function(){ parent.constructor(); };
    };

    CustomClassDefinition.prototype.fix = function () {
        var definition = this;

        var inheritList = this._inheritList;
        //
        var implementedIdList = [];
        inheritList.forEach(function( definition ){ implementedIdList.push( definition.id ); });

        // instanceOf
        function isInstanceOf( constructorOrClass ) {
            if( ( "id" in constructorOrClass ) !== true ) throw new Error( "ERROR: "+this + ".isInstanceOf( " +constructorOrClass+ " );");
            return implementedIdList.indexOf( constructorOrClass.id ) !== -1;
        };


        // 実質のコンストラクター関数
//        function constructor(){
//            var args = arguments;

            function cnst() {
                var args = arguments;
                //
                definition.setupProperties.call( this );

                // call constructor
                definition.constructor.apply( this, args );

                // extend ...
//                this.isInstanceOf = isInstanceOf;
            }
            cnst.prototype = definition.getProto();
            cnst.prototype.isInstanceOf = isInstanceOf;
            cnst.id = definition.id;
            return cnst;
//        };
//        constructor.id = definition.id;

//        return constructor();
    };


    /**
     * クラス定義
     * <pre>
     * //usecase
     * var Sample = new Class( Parent, function( cls, parent ){
     *
     *      // property
     *      cls._name = null;
     *
     *      // constructor
     *      cls.constructor = function( name ) {
     *          parent()();
     *          this.name = name;
     *      };
     *
     *      // accessor
     *      cls.name = { get: function(){ return this._name; }
     *
     *      // function
     *      cls.func = function() {
     *          return parent.func()();
     *      }
     * } );
     *
     * var ins = Sample.New( "test" );
     * ins.name // "test"
     * ins.func();
     * </pre>
     *
     * @param {Function} parent or implementation
     * @param {Function} [implementation]
     * @constructor
     */
    var Class = function(){
        var parent = null;
        var impl = null;

        if( arguments.length>1 ) {
            parent = arguments[0] || {};
            impl = arguments[1];
        } else {
            parent = Object;
            impl = arguments[0];
        }

        var definition = new CustomClassDefinition();
        this._id = definition.id;
        definition.inherit( parent );
        definition.implement( impl );
        return definition.fix();
    };

    /**
     *
     */
    if( !window.Class ) window.Class = Class;
    //window.PrototypeClass = Class;

    // AMD
    if ( typeof define === "function" && define.amd )
        define( [], function () { return Class; } );
})();

(function (){// TEST
    return;
    var Base = Class( function( cls, parent ){

        cls.name = { get: function(){ return this._name } };

        cls.value = 123;

        cls.constructor = function( name ){
            console.log( "Base.constructor",this, name );
            this._name = name;
        };

        cls.getName = function(){
            return this._name;
        };
    } );

    var Test = Class( Base, function( cls, parent ){
        cls.constructor = function( name ){
            console.log( "Test.constructor",parent, parent.constructor );
            parent.constructor( name );
        }

        cls.getName = function( ){
            return "Test "+parent.getName.call( this );
        }

        cls.getNickName = function(){
            return "n_"+this._name;
        }
    } );
    var ins = new Test( "aaa" );
    console.log( ins.getName() );
})();
