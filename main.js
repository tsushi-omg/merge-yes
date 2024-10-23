// 変数定義
let thArray = [];//0番地は<th></th>なので空（明細ラジオ用）呼び出すのは１から
let array = [];

var mock;
var bean;

var thCount;//カラム数※ラジオ含む
var gamenID;//画面id
var meisaiID;//明細id

var boxSelect;

//実行
function convert(){
    //変数定義
    mock=document.getElementById('mock').value;
    bean=document.getElementById('bean').value;
    gamenID=bean.substring(bean.indexOf("ENG",0),bean.indexOf("ENG",0)+8);
    setMeisaiID();
    initArray();
    saveColumn();
    

    //変換処理　※実行順序変えない！

        //ヘッダー部
        conKensu();//件数**
        conTextBox();//テキストボックス＆ラベル**
        conKensaku();//検索ボタン**
        conMushi();//🔍ボタン**

        //明細部　完了
        trimMeisai();//明細繰り返し除去**
        conMeisaiLabel();//明細ラベル**
        conMeisaiRadio();//明細ラジオ**

        //フッター部
        conFooter();//フッターボタン**

        //画面構成
        deleteMsg();//メッセージ部除去**
        trimArticle();//articleより上　＆　articleより下且つ<!--フッタコンテンツより上を削除**
        tagFooter();//フッターuiタグ追加**
        cutFooterEnd();//フッター下の不要箇所切り取り**
        addTop();//beanの上部を追加**
        cutMemo();//テンプレートコントロール関連のメモを削除


    //結果の格納
    document.getElementById('resultArea1').value=mock;
}

//カラム名を格納　※カラム名を取得して保存するだけなのでモックに影響なし
function saveColumn(){//動確済み**
    var start = 0;
    var start2= 0;
    //カラム数をカウント（<thead　→　<tr　→　</tr>　→　<th）(</thead>も記録し、ヒットしたのがこれより大きいインデックスであればbreak)
    var count = 0;
    var border = mock.indexOf("</thead>",0);
    if(mock.indexOf(`<thead`,start) != -1){
        start = mock.indexOf(`<thead`,start)+5;
    };
    for(let i = 0; i < 20; i++){//決め打ち20回実行
        if(mock.indexOf(`<th`,start) != -1){
            start = mock.indexOf(`<th`,start)+3;
            if(start < border){
                count++;
            }else{
                break;
            }
        }
    };
    thCount=count;

    //カラム名を取得※カラム数だけ繰り返し(<thead　→　<th　→　>　→　</th>　※>から</thの間をsubstringして格納)
    if(mock.indexOf(`<thead`,start2) != -1){
        start2 = mock.indexOf(`<thead`,start2)+5;
    };
    for(let i = 0; i < count; i++){
        if(mock.indexOf(`<th`,start2) != -1){
            start2 = mock.indexOf(`<th`,start2);

            if(mock.indexOf(`>`,start2) != -1){
                var a = mock.indexOf(`>`,start2);//a = <th ○○>←
                start2 = mock.indexOf(`>`,start2);
                
                if(mock.indexOf(`</th`,start2) != -1){
                    var b = mock.indexOf(`</th`,start2);//b = →</th>
                    start2 = mock.indexOf(`</th`,start2);

                    thArray[i] = mock.substring(a+1,b);
                }
            }
        }
    };

};

//明細ラベル変換　　動確済み***
function conMeisaiLabel(){
    //ラベルid取得(カラム名　→　<h:outputText　→　>)
    for(let i = 1; i <= thCount; i++){
        if(bean.indexOf(thArray[i],0) != -1){
            var start = bean.indexOf(thArray[i],0);
            if(bean.indexOf(`<h:outputText`,start) != -1){
                var a = bean.indexOf(`<h:outputText`,start);//　→<h:output…
                if(bean.indexOf(`>`,a) != -1){
                    var b = bean.indexOf(`>`,a);//　/>←
                    var label = bean.substring(a,b+1);//beanのラベル
                    //モック配列の対象ラベルクリア（<tbody　→　<label　→　</label>）
                    var start2 = mock.indexOf("<tbody",0);
                    if(mock.indexOf("<label",start2) != -1){
                        start2=mock.indexOf("<label",start2);
                        var c =mock.indexOf("<label",start2);//　→<label
                        if(mock.indexOf("</label>",start2) != -1){
                            var d = mock.indexOf("</label>",start2) + 7;// </label>←
                            //クリア
                            for(let j = c; j <= d; j++){
                                array[j]="";
                            }
                            var classFlg = false;
                            //クラス属性取得(class　→　"　→　")
                            if(mock.indexOf("class",c) != -1){
                                var start3 = mock.indexOf("class",c);
                                if(start3 < d){
                                    classFlg = true;//クラス属性あり
                                    if(mock.indexOf('"',start3) != -1){
                                        var e = mock.indexOf('"',start3);//class="←
                                        start3 = mock.indexOf('"',start3)+1;

                                        if(mock.indexOf('"',start3) != -1){
                                            var f = mock.indexOf('"',start3);//class="　"←
                                            var classP = mock.substring(e+1,f);
                                        }
                                    }
                                }
                            }//ここまで動確済み**
                            //テンプレートに代入
                            if(classFlg==true){
                                // labelを配列に格納→最後のインデックスにクラス属性を追加→label変数に再代入
                                let labelArray = [];
                                for(let j = 0; j <= label.length; j++){
                                    labelArray[j]=label[j];
                                }
                                labelArray[labelArray.length-2]="";// >
                                labelArray[labelArray.length-3]=`styleClass="${classP}" />`;// →/>
                                label = labelArray.join("");
                                array[c]=label;
                            }else{
                                array[c]=label;
                            }
                            inArray();//終了
                        }
                    }
                }
            }
        }
    }
    //変換処理(<tbody　→　<label　→　</label>)※必要プロパティ：ラベルID、明細ID、あればクラス属性
};

//明細繰り返し除去(２回目以降のtrを除去)※リピートなどが消えるので、リピートタグ追加とかは一番最後に実行する
function trimMeisai(){//動確済み！***
    // 変換処理（<tbody　→　<tr　→　<tr　→　</tbody>※これ-1までクリア）
    if(mock.indexOf(`<tbody`,0) != -1){
        var start = mock.indexOf(`<tbody`,0);

        if(mock.indexOf(`<tr`,start) != -1){
            var start2 = mock.indexOf(`<tr`,start);

            if(mock.indexOf(`<tr`,start2+3) != -1){
                var start4 = mock.indexOf(`<tr`,start2+3);//２回目の→<tr

                if(mock.indexOf(`</tbody`,start4+3) != -1){//　→</tbody
                    var start5 = mock.indexOf(`</tbody`,start4+3);
                    
                    //クリア
                    for(let i = start4; i < start5; i++){
                        array[i]="";
                    }
                    inArray();//終了
                }
            }
        }
    }
};

//件数変換
function conKensu(){
    //変換処理(①件中　→　遡ってclass　→　>　②件中　→　>)※①～②の間をクリアしてテンプレ
    var a;
    var b;
    if(mock.indexOf("件中",0) != -1){
        var start = mock.indexOf("件中",0);
        for(let i = start; i > start-500; i--){//決め打ち500文字
            if(mock[i]=="s" && mock[i-1]=="s" && mock[i-2]=="a" && mock[i-3]=="l" && mock[i-4]=="c"){
                a=i;
                if(mock.indexOf(`>`,a) != -1){
                    a=mock.indexOf(`>`,a);//<ddなど class="">←　件中</ddなど>
                }
                break;
            }
        }
        if(mock.indexOf(`>`,start) != -1){
            b=mock.indexOf(`>`,start);//件中</labelなど>←
            // クリア
            for(let i = a+1; i <= b; i++){
                array[i]="";
            }
            //テンプレ代入
            array[a+1]=`
            <h:outputText id="topSeq" value="#{${gamenID}.topSeq}" formatComma="true"/>
            <span>～</span>
            <h:outputText id="tempKensu" value="#{${gamenID}.tempKensu}" formatComma="true"/>
            <span>/</span>
            <h:outputText id="hitKensu" value="#{${gamenID}.hitKensu}" formatComma="true"/>
            <span>件中</span>`;
            inArray();//終了
        }
    }
};

//明細ラジオ　※クラスは絶対にある　動確済み**
function conMeisaiRadio(){
    // 変換処理(<tbody　→　<input　→　class　→　"　→　"　→　>　)※画面id、明細id、クラス属性
    var classP;
    var start = mock.indexOf(`<tbody`,0);

    start = mock.indexOf(`<input`,start);
        var x = start;//→<input  >
    start = mock.indexOf(`class`,start);
    start = mock.indexOf(`"`,start+2);
        var a = start;//class="←
    start = mock.indexOf(`"`,start+2);
        var b = start;//class="  "←
    start = mock.indexOf(`>`,start)
        var c = start;//<input   >←

    // クラス属性取得
    classP = mock.substring(a+1,b);

    // クリア
    for(let i = x; i <= c; i++){
        array[i]="";
    }

    //テンプレートに代入
    array[x]=`<h:selectOneRadio id="rowNo" value="#{${gamenID}.rowNo}" styleClass="${classP}" group="rowNo">
    <f:selectItem itemValue="#{${gamenID}.${meisaiID}.rowIndex}"/>
</h:selectOneRadio>`;

    inArray();//終了
};


//テキストボックス　動確済み**
function conTextBox(){
    //変換処理(<input　→　type　→　"　→　"　→　text　※存在かつ２番目の " より小さいインデックス　→　処理続行　→　遡って<span　→　>　→　</span　→　span間の文字列記録)
    //(bean➤➤　文字列　→　<h:inputText　→　>　→　クラスを編集して格納)
    //プロパティ：クラス属性、遡った文字列、対象の生成ボックス（クラス編集　＆　閉じたぐ編集必要）
    var start = 0;
    for(let i = 1; i <= 10; i++){//決め打ち10回実行
        
        // 変数定義
        var text;
        var classP;
        var tmp;

        start = mock.indexOf(`<input`,start);
        var a = start;//　→<input
        var end = mock.indexOf(`>`,a);// >←
        start=mock.indexOf(`type`,start);
        start=mock.indexOf(`"`,start);
        if(mock[start+1]=="t" && mock[start+2]=="e" && mock[start+3]=="x" && mock[start+4]=="t"){
            // クラス属性取得　動確済み**
            start = mock.indexOf("class",a);
            start = mock.indexOf(`"`,start);
            var b = start;//class="← "
            start = mock.indexOf(`"`,start+1);
            var c = start;//class="　"←
            classP = mock.substring(b+1,c);

            //遡って直近の文字列取得　動確済み**
            for(let j = start; j >= start-1000; j--){
                if(mock[j]=="n" && mock[j-1]=="a" && mock[j-2]=="p" && mock[j-3]=="s" && mock[j-4]=="<"){
                    start=j;
                    start=mock.indexOf(`>`,start);
                    var d = start;//<span>←　農協コード</span>
                    start=mock.indexOf(`</span`,start);
                    var e = start;//<span>農協コード　→</span>
                    text = mock.substring(d+1,e);
                    break;//1000文字分余裕持ってとっているので巻き込んでしまう
                }
            }

            //beanからテンプレを取得 動確済み**
            start = bean.indexOf(text,0);
            start = bean.indexOf(`<h:inputText`,start);
            var f = start;//　→<h:inputText
            start = bean.indexOf(`>`,start);
            var g = start;//　>←
            tmp = bean.substring(f,g+1);
            
            //テンプレを編集（クラス属性、閉じたぐ）(配列に移動　→　styleClass　→　"　→　"　→　>　)　動確済み**
            let tmpArray=[];
            for(let k = 0; k <= tmp.length; k++){
                tmpArray[k]=tmp[k];
            }
            start = tmp.indexOf(`styleClass`,0);
            start = tmp.indexOf(`"`,start);
            var h = start;//styleclass="←  "
            start = tmp.indexOf(`"`,start+1);
            var m = start;//styleclass="  "←
            start = tmp.indexOf(`>`,start);
            var n = start;// >
            for(let p = h+1; p <= m-1; p++){
                tmpArray[p]="";
            }
            tmpArray[h+1]=classP;
            tmpArray[n]=` />`;
            tmp=tmpArray.join("");

            //モッククリア
            for(let y = a; y <= end; y++){
                array[y]="";
            };

            //テンプレ格納
            array[a]=tmp;

            inArray();//モック更新--ここまで動確済み**

            //ラベル変換(text　➤　<label　→　</label>　→　クリア)
            //ラベル変換(bean！ text　➤　<h:outputText　→　>　)
            start = mock.indexOf(text,0);
            start = mock.indexOf(`<label`,start);
            var aa = start;//　→<label
            start = mock.indexOf(`</label>`,start);
            var bb = start+7;//　</label>←
            //モッククリア
            for(let zz = aa; zz <= bb; zz++){
                array[zz]="";
            }
            //beanからラベル取得
            start = bean.indexOf(text,0);
            start = bean.indexOf(`<h:outputText`,start);
            var cc = start;//　→<h:outputText
            start = bean.indexOf(`>`,start);
            var dd = start;// >←
            var beanLabel = bean.substring(cc,dd+1);
            //格納
            array[aa]=beanLabel;

            inArray();//終了

        }
    }
};


// 検索ボタン　動確済み**
function conKensaku(){
    
    //変換処理("検索"　→　遡って→<input　→　class　→　"　→　"　→　>　クリア　→　テンプレ代入)※クラス属性
    var a,b,c,d,classP;
    if(mock.indexOf(`"検索"`,0) != -1){
        var start = mock.indexOf(`"検索"`,0);
        for(let i = start; i >= start-200; i--){
            if(mock[i]=="t" && mock[i-1]=="u" && mock[i-2]=="p" && mock[i-3]=="n" && mock[i-4]=="i" && mock[i-5]=="<"){
               start = i-5;
               a=start;//　→<input
               break;
            }
        }

        start = mock.indexOf("class",start);
        start = mock.indexOf(`"`,start);
        c = start;//class="←  "
        start = mock.indexOf(`"`,start+1);
        d = start;//class="  "←
        start = mock.indexOf(`>`,start);
        b = start;//<input     >←
        classP=mock.substring(c+1,d);

        //モッククリア
        for(let i = a; i <= b; i++){
            array[i]="";
        }

        //テンプレ
        array[a]=`<h:commandButton action="#{${gamenID}.kensaku}" id="kensakuButton" styleClass="${classP}" value="検索" />`;

        inArray();//終了
    }
};


// 🔍ボタン 動確済み**
function conMushi(){
    //変換処理(fa-search　→　遡って<button　保持　→　class　→　"　→　"　→　クラス属性保存　→　</button>　→　開始位置用に位置記録　→　クリア)　※決め打ち10回実行　位置更新必須
    //(bean➤　<h:commandButton　→　>　→　変数に格納　→　配列に移動　→　編集)
    //（配列・退避変数　編集➤　>　※length-1番地をメモの様に変更　→　value　→　"　→　"　→　クリア　→　"を"&#xf002;に変更　→ 変数に再代入join　→　変数を<buttonの<に代入）
    var start = 0;
    var startBean = 0;
    for(let i = 0; i <= 10; i++){
        if(mock.indexOf("fa-search",start) != -1){
            var start = mock.indexOf("fa-search",start);
            var startmock = mock.indexOf(`<d`,start);
            var a,b,c,d,e,f,g,h;
            var classP,tmp;
            let tmpArray=[];

            for(let j = start; j >= start-200; j--){
                if(mock[j]=="n" && mock[j-1]=="o" && mock[j-2]=="t" && mock[j-3]=="t" && mock[j-4]=="u" && mock[j-5]=="b" && mock[j-6]=="<"){
                    start = j-6
                    a = start;//　→<button
                    break; 
                }
            }//ここまで動確済み**

            //クラス属性取得
            start=mock.indexOf("class",start);
            start=mock.indexOf(`"`,start);
            b=start;//class="←  "
            start=mock.indexOf(`"`,start+1);
            c=start;//class="　　"←
            classP=mock.substring(b+1,c);
            start=mock.indexOf("</button>",start)+8;
            d=start;//</button>←

            //モッククリア
            for(let j = a; j <= d; j++){
                array[j]="";
            }

            //bean取得
            startBean = bean.indexOf(`<h:commandButton`,startBean);
            e=startBean;// →<h:commandButton
            startBean=bean.indexOf(">",startBean);
            f=startBean;//<h;commandButton   >←
            tmp = bean.substring(e,f+1);

            //配列に格納
            for(let j = 0; j <= tmp.length-1; j++){
                tmpArray[j]=tmp[j];
            }
            
            //編集
            start = tmp.indexOf("value",0);
            start = tmp.indexOf(`"`,start);
            g=start;//value="←  "
            start = tmp.indexOf(`"`,start+1);
            h=start;//value=" "←
            tmpArray[g]=`"&#xf002;`;
            //クリア
            for(let j = g+1; j <= h-1; j++){
                tmpArray[j]="";
            }
            tmpArray[tmpArray.length-1]=`styleClass="${classP}" >
              <f:passThroughAttribute name="tabindex" value="-1"/>
            </h:commandButton>`;

            //再代入
            tmp=tmpArray.join("");

            //テンプレ代入
            array[a]=tmp;
            
            //位置更新
            start=startmock;//次の<d…　タグ
            startBean=f;//<h:command　>
            
            inArray();//終了

        }else{
            break;
        }
    }
    
}


// フッターボタン　※対応ボタン　：　戻る、入力取消、前頁、次頁、決定　（５）動確済み**
function conFooter(){

    // ボタン存在チェック
    if(mock.indexOf("戻る",0) != -1){
        conFooterButton("戻る",mock.indexOf("戻る",0));
    };

    if(mock.indexOf("入力取消",0) != -1){
        conFooterButton("入力取消",mock.indexOf("入力取消",0));
    };

    if(mock.indexOf("前頁",0) != -1){
        conFooterButton("前頁",mock.indexOf("前頁",0));
    };

    if(mock.indexOf("次頁",0) != -1){
        conFooterButton("次頁",mock.indexOf("次頁",0));
    };

    if(mock.indexOf("決定",0) != -1){
        conFooterButton("決定",mock.indexOf("決定",0));
    };
    
    function conFooterButton(name,start){

        var a,b,c,d,classP,utf,id,action;

        // クラス属性取得(遡ってinput　→　class　→　"　→　"　→　class属性保存)
        for(let i = start; i >= start-200; i--){
            if(mock[i]=="t" && mock[i-1]=="u" && mock[i-2]=="p" && mock[i-3]=="n" && mock[i-4]=="i" && mock[i-5]=="<"){
                start = i;
                c=start-5;//　→<input
                break;
            }
        }
        start = mock.indexOf("class",start);
        start=mock.indexOf(`"`,start);
            a=start;
        start=mock.indexOf(`"`,start+1);
            b=start;
        classP=mock.substring(a+1,b);

        // 文字コード、id、アクション
        if(name=="戻る"){
            utf=`&#xf060;`;
            id="modoruButton";
            action="modoru";
        }else if(name=="入力取消"){
            utf=`&#xF55a;`;
            id="cancelButton";
            action="cancel";
        }else if(name=="前頁"){
            utf=`&#xf0d9;`;
            id="previousPageButton";
            action="previousPage";
        }else if(name=="次頁"){
            utf=`&#xf0da;`;
            id="nextPageButton";
            action="nextPage";
        }else if(name=="決定"){
            utf=`&#xf058;`;
            id="ketteiButton";
            action="kettei";
        }

        // モッククリア
        d=mock.indexOf(">",c); //<input  />←
        for(let i = c; i <= d; i++){
            array[i]="";
        }
        // テンプレ代入
        array[c]=`<h:commandButton id="${id}" value="${utf} ${name}" styleClass="${classP}" action="#{${gamenID}.${action}}" onclick="return myEvent.${id}Event(event, this);" />`;

        inArray();//終了
    }
};



// メッセージ部分削除　動確済み**
function deleteMsg(){

    // 切り取り処理（システムメッセージ　→　遡って<div　→　</div>　→　クリア）
    var start,a,b;

    start=mock.indexOf("システムメッセージ",0);
    for(let i = start; i >= start-200; i--){
        if(mock[i]=="v" && mock[i-1]=="i" && mock[i-2]=="d" && mock[i-3]=="<"){
            a = i-3;//　→<div
            break;
        }
    }
    start=mock.indexOf("</div>",start);
    b=start+5;//</div>←

    //モッククリア
    for(let i = a; i <= b; i++){
        array[i]="";
    }
    array[a]=`<!-- フッタコンテンツ -->`;
    inArray();//終了
};



//articleより上　＆　articleより下且つ<!--フッタコンテンツより上を削除　動確済み**
function trimArticle(){
    
    //削除処理

    var a,b,c;

    a=mock.indexOf("<article",0);
    // クリア
    for(let i = 0; i < a; i++){
        array[i]="";
    }

    b=mock.indexOf("</article>",0)+10;//タグ含まないインデックス
    c=mock.indexOf(`</main>`,0)+6;

    // クリア
    for(let i = b; i <= c; i++){
        array[i]="";
    }

    array[b]=`
</ui:define>
`;
    
    inArray();//終了

};


//フッターuiタグ追加　※footerタグを変換　動確済み**
function tagFooter(){

    //変換処理(<footer　→　>　→　クリア　→　変換)(</footer>　→　クリア　→　変換)
    var a,b,c,d;

    //位置取得
    a=mock.indexOf(`<footer`,0);//　→<footer
    b=mock.indexOf(`>`,a);// <footer   >←
    
    c=mock.indexOf(`</footer>`,0);//　→</footer>
    d=c+8;// </footer>←

    //クリア
    for(let i = a; i <= b; i++){
        array[i]="";
    }
    for(let i = c; i <= d; i++){
        array[i]="";
    }

    //変換
    array[a]=`<ui:define name="footer">`;
    array[c]=`</ui:define>`;

    inArray();//終了

};

//フッター下の不要箇所削除　動確済み**
function cutFooterEnd(){
    //切り取り処理(<ui:define name="footer">　→　</ui:define>　→　mock.length-1　→　クリア)
    var a,b;
    
    a=mock.indexOf(`</ui:define>`,mock.indexOf(`<ui:define name="footer">`))+12;//閉じたぐ含まない
    b=mock.length-1;

    //クリア
    for(let i = a; i <= b; i++){
        array[i]="";
    }

    inArray();//終了

};


// beanの上部を追加　動確済み**
function addTop(){
    //変数定義
    var parts = bean.substring(0,bean.indexOf(`<ui:define name="contents">`,0)+29);
    mock=parts+mock;
    //配列クリア→再格納
    array.length=0;
    for(let i = 0; i < mock.length; i++){
        array[i]=mock[i];
    }
    inArray;//終了
};


//テンプレートコントロール削除
function cutMemo(){
    //除去処理
    
}















//配列＆モック再格納　※共通　動確済み**
function inArray(){
    var code = array.join("");
    //配列クリア
    array.length=0;
    //再格納
    for(let i = 0; i <= code.length; i++){
        array[i]=code[i];
    };
    mock=array.join("");

};


//配列に格納　※初期処理　動確済み**
function initArray(){
    for(let i = 0; i <= mock.length; i++){
        array[i]=mock[i];
    }
};

//明細idセット　動確済み**
function setMeisaiID(){
    //取得(<h:dataTable　→　id　→　"　→　")
    var start = bean.indexOf(`<h:dataTable`,0);
    start = bean.indexOf(`id`,start);
    start = bean.indexOf(`"`,start);
        var a = start;
    start = bean.indexOf(`"`,start+1);
        var b = start;
    meisaiID=bean.substring(a+1,b);
};












