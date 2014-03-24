__req.define([
    "lib/Class",
    "src/NJModule",
    "src/common/event/EventDispatcher"
],function( Class, NJModule, EventDispatcher ){

    var NJApp = Class( NJModule, function( cls, parent ){

        cls.constructor = function(){
            parent.constructor.apply(this,arguments);

            this._messageReciever = null;
            this._statusBarEnabled = true;
            this._sleepModeEnabled = true;
        };


        cls.installTo = function( ctx ) {
//            nativeInstallTo(getNativePtr(), ctx.getNativePtr());

            ctx.App = App;
        }

        cls.initJs = function( ctx ) {
//            nativeInitJs(getNativePtr(), ctx.getNativePtr());

            ctx.app = new App( this );
        }


        cls.reset = function() {
//            nativeReset(getNativePtr());
        }

        cls.pause = function() {
//            nativeNotifyChangeState(getNativePtr(), 1);
        }

        cls.resume = function() {
//            nativeNotifyChangeState(getNativePtr(), 0);
        }

        cls.notifyEnterForeground = function() {
//            nativeNotifyEnterForeground( getNativePtr() );
        }

        cls.notifyEnterBackground = function() {
//            nativeNotifyEnterBackground( getNativePtr() );
        }

        /**  */
        cls.finish_native = function() {
//            activity.finish();
        }

        /** */
        cls.setMessageReciever = function( reciever ) {
            this._messageReciever = reciever;
        }

        /** */
        cls.sendMessage = function( message ) {
//            nativeSendMessage(getNativePtr(), -1, message);
        }

        cls.sendMessage = function( message,  targetId ) {
//            nativeSendMessage(getNativePtr(), targetId, message);
        }

        /** */
        cls.recieveMessage_native = function( message, senderId ) {
//            if (messageReciever != null) messageReciever.onMessage(message, senderId);
        }

        /** URLスキーム利用のアプリ起動 */
        cls.openURL_native = function( url ) {
//            try{
//                activity.startActivity( new Intent( Intent.ACTION_VIEW, Uri.parse( url ) ) );
//                return true;
//            } catch (Exception e) {
//                return false;
//            }
            // TODO iframe?
        }

        /** URLスキーム経由で起動されば場合呼ぶ */
        cls.notifyHandleOpenURL = function( url ) {
//            nativeNotifyHandleOpenURL( getNativePtr(), url );
        }

        /** 言語 */
        cls.getLanguage_native = function() {
//            Locale locale = Locale.getDefault();
//            var tmp = locale.getLanguage();//.toString();
//            return tmp;
            // TODO navigator..
        }

        /** ステータスバーの表示・非表示 */
        cls.getStatusBarEnabled_native = function(){ return this._statusBarEnabled; }
        cls.setStatusBarEnabled_native = function( value ) {
            if( this._statusBarEnabled == value ) return ;
            this._statusBarEnabled = value;

//            if( statusBarEnabled ) activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
//            else activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        }

        /** スリープモードの表示・非表示 */
        cls.getSleepModeEnabled_native = function(){ return this._sleepModeEnabled; }
        cls.setSleepModeEnabled_native = function( value ) {
            if( this._sleepModeEnabled == value ) return ;
            this._sleepModeEnabled = value;

//            if( sleepModeEnabled ) activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
//            else activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        }

        /** ネットワーク取得 @deprecated*/
        cls.getActiveNetworkName_native = function() {
//            ConnectivityManager connectivity = (ConnectivityManager)activity.getApplicationContext().getSystemService(Context.CONNECTIVITY_SERVICE);
//            NetworkInfo network = connectivity.getActiveNetworkInfo();
//            if (network == null) return null;
//            return network.getTypeName();
            return null;
        }
        cls.getActiveNetwork_native = function() {
//            ConnectivityManager connectivity = (ConnectivityManager)activity.getApplicationContext().getSystemService(Context.CONNECTIVITY_SERVICE);
//            NetworkInfo network = connectivity.getActiveNetworkInfo();
//            if (network == null) return -1;
//            return network.getType();
            return -1;
        }

        /**
         * @deprecated やっつけ
         * @return
         */
        cls.getActiveNetworkIP_native = function() {

            //return "127.0.0.1";
        }


        cls.notifyHardwareButtonAction = function( action, buttonName ) {
//            return nativeNotifyHardwareButtonAction( getNativePtr(), action, buttonName );
        }

        cls.getMemoryInfo_native = function() {

//            var javaHeapMax = Runtime.getRuntime().maxMemory();
//            var javaHeapTotal = Runtime.getRuntime().totalMemory();
//            var javaHeapFree = Runtime.getRuntime().freeMemory();
//            var javaHeapAllocated = (javaHeapTotal-javaHeapFree);
//
//            var results[] = new long[2];
//            results[0] = javaHeapAllocated;
//            results[1] = javaHeapMax;
//            return results;
            return [0,0,0];
        }

        cls.getMemoryInfo_native_bk = function() {
            // TODO 処理が重い。FPS60内で呼ぶには

//            // メモリ情報を取得
//            ActivityManager activityManager = (ActivityManager)activity.getSystemService(Activity.ACTIVITY_SERVICE);
//            ActivityManager.MemoryInfo memoryInfo = new ActivityManager.MemoryInfo();
//            activityManager.getMemoryInfo(memoryInfo);
//
//            // 自プロセスが使用中のメモリー
//            int[] pids = new int[1];
//            pids[0] = android.os.Process.myPid();
//            //android.os.Debug.MemoryInfo[] dmi = activityManager.getProcessMemoryInfo(pids);
//            android.os.Debug.MemoryInfo memInfo = activityManager.getProcessMemoryInfo(pids)[0];
//            /*
//             // 使用中のメモリーサイズ(KB)
//             Log.i("ProcessMemoryInfo","TotalPrivate:" + dmi[0].getTotalPrivateDirty());
//             */
//
//            var results[] = new long[2];
//            results[0] = memInfo.getTotalPrivateDirty() * 1024;//getTotalMemorySize()-memoryInfo.availMem;
//            results[1] = memInfo.getTotalPrivateDirty() * 1024 + memoryInfo.availMem;//getTotalMemorySize();
//            //results[2] = memoryInfo.totalMem;//API > 16
//            /*
//             Log.w("MemoryUtils",
//             "activity avail:"+fmt( memoryInfo.availMem ,9)
//             +"  debug total:"+fmt( memInfo.getTotalPrivateDirty() * 1024 ,9)
//             +"  pss:" + fmt( memInfo.getTotalPss() * 1024, 9 ) );
//
//
//
//             var nativeHeapFree = Debug.getNativeHeapFreeSize();
//             var nativeHeapAllocated = Debug.getNativeHeapAllocatedSize();
//
//             var javaHeapFree = Runtime.getRuntime().freeMemory();
//             var javaHeapAllocated = Runtime.getRuntime().totalMemory() - javaHeapFree;
//
//             var javaHeapMax = Runtime.getRuntime().maxMemory();
//
//             Log.w("MemoryUtils",
//             "native free:"+fmt( nativeHeapFree ,9)+" alloc:"+fmt( nativeHeapAllocated, 9 )
//             +"  java free:"+fmt( javaHeapFree ,9) + " alloc:"+fmt( javaHeapAllocated, 9 )
//             +"  max:" + fmt( getTotalMemorySize(), 9 ) );
//             */
//            return results;
            return[0,0,0];
        }


        var totalMemory = 0;
        /**
         * @deprecated
         * @return
         */
        cls.getTotalMemorySize = function() {
//            if(totalMemory!=0) return totalMemory;
//            try {
//                Process process = Runtime.getRuntime().exec("cat /proc/meminfo");
//                BufferedReader br = new BufferedReader(new InputStreamReader(process.getInputStream()), 1024);
//                var line = null;
//                while ((line = br.readLine()) != null) {
//                    // "totalMemTotal:         xxxxxxx kB"の部分だけ抜き出す
//                    if (line.contains("MemTotal:")) {
//                        line = line.replaceAll("\\D+", "");
//                        totalMemory = Long.parseLong(line) * 1024;
//                        return totalMemory;
//                    }
//                }
//            } catch (IOException e) {
//                e.printStackTrace();
//            }
            return 0;
        }


        cls.setClipboardText_native = function( text ) {
            //
//            ClipboardManager cm = (ClipboardManager) activity.getSystemService( Activity.CLIPBOARD_SERVICE );
//            cm.setText( text );
        }

        cls.getVersion_native = function() {
//            try {
//                PackageInfo pinfo = activity.getPackageManager().getPackageInfo( activity.getPackageName(), 0);
//                return String.valueOf( pinfo.versionCode );
//            } catch (Exception e) { ; }
//            return "";
        }

        cls.getBuildVersion_native = function() {
//            try {
//                PackageInfo pinfo = activity.getPackageManager().getPackageInfo( activity.getPackageName(), 0);
//                return pinfo.versionName;
//            } catch (Exception e) { ; }
//            return "";
        }


        cls.setScreenOrientation = function(value) {
            console.log('deprecated. app.setScreenOrientation => window.setOrientationType')
            if( window.setOrientationType )window.setOrientationType(value);
        }
    } );


    var App = Class( EventDispatcher, function( cls, parent ){

        cls.constructor = function( module ){
            parent.constructor.apply(this,arguments);

            this._module = module;
        };

        // prop
        cls.statusBarEnabled = {
            get: function() { return this._module.getStatusBarEnabled_native(); },
            set: function( value ) { this._module.setStatusBarEnabled_native(value); }
        };
        cls.sleepModeEnabled = { get:function(){return true;}, set:function(){} };
        cls.activeNetwork = { get:function(){return null;} };
        cls.activeNetworkIP = { get:function(){return null;} };
        //latestSchemeURL", latestSchemeURL_getter );// getLatestSchemeURLOnceに移行
        //latestNotificationData", latestNotificationData_getter );// getLatestNotificationDataOnceに移行
        cls.language = { get:function(){ return navigator.language; } };
        cls.isIOS = { get:function(){return false;} };
        cls.isANDROID = { get:function(){return false;} };
        cls.isWeb = { get:function(){return true;} };
        cls.version = { get:function(){return 1.0} }; // TODO
        cls.buildVersion = { get:function(){return 1} }; // TODO
        //availableFonts", availableFonts_getter );//Androidが非対応のため利用不可

        cls.memory = function(){};

        // func
        //"finish", finish_js );// 終了機能はApple的にダメ。rejectされるから使えない。
        cls.nativeLog = function(){ };
        cls.sendMessage = function(){};
        cls.gc = function(){};
        cls.openURL = function(url){
            //
            var a = document.createElement("a");
            a.href = url;
            a.target = "_blank";
            document.head.appendChild(a);
            a.click();
        };
        cls.setClipboardText = function(){
            //
            console.warn("not supported.");
        };
        cls.getLatestSchemeURLOnce = function(){};
        cls.getLatestNotificationDataOnce = function(){};// @deprecated 20131205 追加

        cls.setScreenOrientation = function(value) {
            this._module.setScreenOrientation(value);
        };
    });

    return NJApp;
});