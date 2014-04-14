define([
    "lib/Class",
    "./InteractiveObject"
],function( Class, InteractiveObject ){

    var DisplayObjectContainer = Class( InteractiveObject, function( cls, parent ){

        cls.constructor = function() {
            parent.constructor.apply(this,arguments);

            this._children = [];

            this._updatedChildrenForWorkChildren = true;
            this._updatedChildrenForRenderingNode = true;
        };


        // property
        cls.numChildren = {get: function(){ return this._children.length; } };
        cls.mouseChildren = true;

        // function

        cls.addChild = function( child ){
            return this.addChildAt( child, this._children.length );
        };
        cls.addChildAt = function( child, index ) {
            if( !child ) return console.log("warning: "+this+".addChild child="+child );
            if( index < 0 ) return console.log( "warning: out of range." );
            if( this._children.length < index ) return console.log( "warning: out of range." );

            if( child._parent ) child._parent.removeChild( child );

            this._children.splice( index, 0, child );
            child._setParent( this );

            this._requestCalcNaturalRect();

            this._childrenUpdated();

            // dispatch events
            //  added
            var propagateList = [];
            var nodes = child._getNodesToRoot();
            for ( var i = nodes.length-1; i>=0; i-- )
                propagateList.push( nodes[i] );
            child._propagateEvent( new Event( "added"), propagateList );

            //  addedToStage
            if( child.stage ) child._notifyOnAddedToStage();


            return child;
        };

        cls.getChildIndex = function( child ){
            return this._children.indexOf( child );
        };
        cls.getChildAt = function( index ){
            if( this._children.length <= index ) return null;
            return this._children[index];
        };
        cls.getChildByName = function( name ) {
            for( var i=this._children.length-1; i >= 0; i-- )
                if( this._children[i].name === name )
                    return this._children[i];
            return null;
        };

        cls.removeChild = function( child ) {
            var index = this._children.indexOf( child );
            if( index === -1 ) return console.log("warning: "+this+".removeChild("+child+")");//throw new Error("removeChild("+child+")");
            return this.removeChildAt( index );
        };
        cls.removeChildAt = function( index ) {
            if( index < 0 ) return console.log( "warning: out of range." );
            if( this._children.length <= index ) return console.log("warning: out of range.");//throw new Error( "out of range." );


            var child = this._children[ index ];

            var propagateList = [];
            var nodes = child._getNodesToRoot();
            for ( var i = nodes.length-1; i>=0; i-- )
            propagateList.push( nodes[i] );


            this._children.splice( index, 1 )[0];
            child._setParent( null );


            this._requestCalcNaturalRect();

            this._childrenUpdated();

            // dispatch events
            //  removed
            child._propagateEvent( new Event( "removed"), propagateList );

            //  removedFromStage
            if( !child.stage ) child._notifyOnRemovedFromStage();


            return child;
        };


        cls.contains = function( child ){
            if( this === child ) return true;
            if( this._children.indexOf(child) !== -1 ) return true;
            var children = this._children;
            var length = children.length;
            for( var i = 0; i < length; i++ )
                if( children[i].contains(child) )
                    return true;
            return false;
        };

        cls.setChildIndex = function( child, index ) {
            this.addChildAt( child, index );
        };
        cls.swapChildren = function( child1, child2 ) {
            var index1 = this.getChildIndex( child1 ), index2 = this.getChildIndex( child2 );
            // filter
            if( index1 == -1 || index2 == -1 ) return;// error?

            this.addChildAt( child1, index2 );
            this.addChildAt( child2, index1 );

            //
            this._childrenUpdated();
        };
        cls.swapChildrenAt = function( index1, index2 ) {
            // filter
            var len = this.numChildren();
            if( index1 >= len || index2 >= len || index1 < 0 || index2 < 0 ) return;// error?

            this.swapChildren( this.getChildAt(index1), this.getChildAt(index2) );
        };


        // internal
        cls._childrenUpdated = function(){
            this._updatedChildrenForWorkChildren = true;
            this._updatedChildrenForRenderingNode = true;
        }


        /**  */
        cls._notifyOnAddedToStage = function() {
            DisplayObject.prototype._notifyOnAddedToStage.call(this);

            var children = this._children.slice();// TODO コピー処理の負荷を減らす vector内のnew,freeが重い
            var len = children.length;
            for( var i = 0; i < len; i++ )
                children[i]._notifyOnAddedToStage();
        };

        /**  */
        cls._notifyOnRemovedFromStage = function() {
            DisplayObject.prototype._notifyOnRemovedFromStage.call(this);

            var children = this._children.slice();// TODO コピー処理の負荷を減らす vector内のnew,freeが重い
            var len = children.length;
            for( var i = 0; i < len; i++ )
                children[i]._notifyOnRemovedFromStage();
        };

        cls._notifyOnEnterFrame = function() {
            DisplayObject.prototype._notifyOnEnterFrame.call(this);

            var children = this._children.slice();// TODO コピー処理の負荷を減らす vector内のnew,freeが重い
            var len = children.length;
            for( var i = 0; i < len; i++ )
                children[i]._notifyOnEnterFrame();
        };
        cls._notifyOnFrameConstructed = function() {
            DisplayObject.prototype._notifyOnFrameConstructed.call(this);

            var children = this._children.slice();// TODO コピー処理の負荷を減らす vector内のnew,freeが重い
            var len = children.length;
            for( var i = 0; i < len; i++ )
                children[i]._notifyOnFrameConstructed();
        }
        cls._notifyOnExecuteFrameScript = function() {
            DisplayObject.prototype._notifyOnExecuteFrameScript.call(this);

            var children = this._children.slice();// TODO コピー処理の負荷を減らす vector内のnew,freeが重い
            var len = children.length;
            for( var i = 0; i < len; i++ )
                children[i]._notifyOnExecuteFrameScript();
        }
        cls._notifyOnExitFrame = function() {
            DisplayObject.prototype._notifyOnExitFrame.call(this);

            var children = this._children.slice();// TODO コピー処理の負荷を減らす vector内のnew,freeが重い
            var len = children.length;
            for( var i = 0; i < len; i++ )
                children[i]._notifyOnExitFrame();
        }
        cls._drawVectorGraphics = function() {
            DisplayObject.prototype._drawVectorGraphics.call(this);

            var children = this._children.slice();// TODO コピー処理の負荷を減らす vector内のnew,freeが重い
            var len = children.length;
            for( var i = 0; i < len; i++ )
                children[i]._drawVectorGraphics();
        }

        cls._glPrepare = function( visitor ) {
            var node = this._getRenderingNode();

            //WeakChildren& children = childrenRef;
            var children = this._children;//.slice();

            var len = children.length;


            if( this._updatedChildrenForRenderingNode ) {
                // 更新済みリストを反映しつつ処理伝播
                this._updatedChildrenForRenderingNode = false;
                var nodeChildren = node.children;
                nodeChildren.length = 0;

                for( var i = 0; i < len; i++ ) {
                    var rObj = children[i]._glPrepare( visitor );
                    if( rObj == null ) continue;
                    nodeChildren.push( rObj );
                }

            } else {
                //
                for( var i = 0; i < len; i++ )
                    children[i]._glPrepare( visitor );
            }

            return DisplayObject.prototype._glPrepare.call( this, visitor );
        }


        // internal
        cls._calculateNaturalRect = function() {
            // updateNaturalRect
            this._naturalRect.setEmpty();

            var children = this._children.slice();
            var len = children.length;
            for( var i = 0; i < len; i++ )
                if( children[i].visible )
                    this._naturalRect = this._naturalRect.union( children[i]._getBoundsRect() );
        }

        cls._hitTestStrictInternal = function( p ) {
            // filter
            if( parent._hitTestStrictInternal.call( this, p ) == null ) return null;

            //
            var test = null;
            var m = this._getMatrix();
            m.invert();
            p = m.transformPoint( p );
            //
            var hit = false;
            for( var i = this.numChildren - 1; i >= 0 ; i-- ) {

                // visible テスト対象外
                if( this.getChildAt(i).visible != true ) continue;

                // hitTest
                test = this.getChildAt(i)._hitTestStrictInternal( p );

                // filter テスト失敗
                if( test == null ) continue;

                // mouseChildren? 子をインタラクティブとして扱わない場合は自身を返す
                if( this.mouseChildren != true ) return this;

                // interactive? テスト成功したが子がインタラクティブでない場合は他の子要素をテストし、成功しなければ自身を返す
                if( test.isInstanceOf( InteractiveObject ) != true || test.mouseEnabled != true ) {
                    hit = true;
                    continue;
                }

                return test;
            }

            if( hit ) return this;

            return null;
        }

        cls.toString = function(){ return "[object DisplayObjectContainer name=\""+this.name+"\"]" }
    } );

    return DisplayObjectContainer;
});