/**
 * 盤面を表示する関数群
 */
class GBOARD {
  /**
   * コンストラクタ new GBOARD( "board" );で呼び出される
   * @param {string} parent 盤面を表示する div の id名
   */
  constructor(parent){
    this.parent = document.getElementById(parent);
    
    // 64マスの情報を保持する配列
    this.sq = new Array(64);

    // 64マスを生成する
    for ( let i = 0; i < this.sq.length; i++) {
      // １つのマスを表現する div 要素
      let e = document.createElement('div');
      e.className = "sq";
      let x = (i % 8) * 29 + 12; // 29:1マスの幅, 12:枠の太さ
      let y = Math.floor( i / 8 ) * 29 + 12; // 29:1マスの高さ, 12:枠の太さ
      e.style.left = x + "px";
      e.style.top =  y + "px";

      e.parent = this; // ここでのthisはGBOARDクラスのインスタンス
      e.myid = i;
      e.addEventListener("click", function() {
        // ここでのthisはeと同じ、そのため this.parentがGBOARDクラスのインスタンスとなる
        this.parent.OnClick(this.myid);
      });
      
      // 石を表現する div 要素
      let d = document.createElement('div');
      d.className = "disc";
      d.style.display = "none";
      e.appendChild( d );
      e.disc = d;
      
      // div要素を追加する
      this.parent.appendChild( e );

      this.sq[i] = e;
    }
  }

  /**
   * setDisc (x,y) のマスに石を置く
   * style.xxx = yyy; cssを設定する
   * @param {number} x 横方向の座標 0～7 0:左端, 7:右端
   * @param {number} y 縦方向の座標 0～7 0:上端, 7:下端
   * @param {number} d 置く石の種類 0:石を消す, 1:黒石を置く, 2:白石を置く
   */
  setDisc( x, y, d ){
    console.log(x,y,d)
    let p = y * 8 + x;
    
    // d==0 の場合は非表示に
    this.sq[p].disc.style.display = d == 0 ? "none" : "block";

    if( d > 0 ){
      // 石の色の指定によって背景色を切り替える
      this.sq[p].disc.style.backgroundColor = d == 1 ? "black" : "white";
    }
  }
  
  /**
   * update 盤面を表示する
   * @param {Object} bd Othelloクラスのインスタンス
   */
  update( bd ) {
    for ( let y = 0; y < 8; y++ ) {
      for ( let x = 0; x < 8; x++ ) {
        this.setDisc( x, y, bd.get(x,y) );
      }
    }
  }
  
  /**
   * 盤面のどこかがクリックされた時に実行される
   * @param {number} id 0～63 クリックされた場所
   */
  OnClick( id )　{
    OnClickBoard( id );
  }
}

/**
 * 盤面に石を置く関数郡
 */
class Othello {

  // クラス内変数
  // 8方向へ進む時に加算する値
  // -10: 斜め左上, -9: 一つ上, -8: 斜め右上
  // -1: 一つ左へ, 1:一つ右へ
  // 8: 斜め左下, 9:一つ下, 10:斜め右下
  VECT = [ -10, -9, -8, -1, 1, 8, 9, 10 ];

  /**
   * コンストラクタ new Othello();で呼び出される
   */
  constructor() {
    // bd:位置番号用変数を初期化する
    // 8:盤面の外側の値で埋める
    this.bd = new Array(91);

    for ( let i = 0; i < this.bd.length; i++ ) {
      this.bd[i] = 8;
    }

    // 0:盤面の内側を石が置かれていない状態にする
    for ( let y = 0; y < 8; y++ ) {
      for ( let x = 0; x < 8; x++ ) {
        this.bd[this.pos(x,y)] = 0;
      }
    }
    // 1:黒石, 2:白石, 最初は中央に4個の石を置く
    this.bd[this.pos(3,3)] = 2;
    this.bd[this.pos(4,3)] = 1;
    this.bd[this.pos(3,4)] = 1;
    this.bd[this.pos(4,4)] = 2;
    
    // 先攻は黒石(1)とする
    this.turn = 1;
  }

  /**
   * pos (x,y) の位置番号を取得
   * @param {number} x 横方向の座標 0～7 0:左端, 7:右端
   * @param {number} y 縦方向の座標 0～7 0:上端, 7:下端
   * @returns number 位置番号 0～90 盤の外にも番号が振られている(youtubeを参照)
   */
  pos( x, y ) {
    return (y + 1) * 9 + x + 1;
  }
  
  /**
   * get (x,y) のマスの状態を取得
   * @param {number} x 横方向の座標 0～7 0:左端, 7:右端
   * @param {number} y 縦方向の座標 0～7 0:上端, 7:下端
   * @returns number 状態 0:石が無い, 1:黒石がある, 2:白石がある
   */
  get( x, y ) {
    return this.bd[this.pos(x, y)];
  }
  
  /**
   * move (x,y) のマスに打つ
   * @param {number} x 横方向の座標 0～7 0:左端, 7:右端
   * @param {number} y 縦方向の座標 0～7 0:上端, 7:下端
   * @returns number 返した石の数 0:打てなかった, 1以上:打てた
   */
  move( x, y ) {
    let p = this.pos( x, y );
    console.log(p)
    if ( this.bd[p] != 0 ) {     // 空きマスでなければ、
      return 0;                  // ここには打てない
    }
    let flipdiscs = 0;
    let oppdisc = this.turn == 2 ? 1 : 2;
    for ( let v = 0; v < this.VECT.length; v++ ) {  // 8方向全てについて；
      let vect = this.VECT[v];

      let n = p + vect;      // vect方向の隣のマス

      let flip = 0;
      while (this.bd[n] == oppdisc) {  // 連続する相手の石を
        n += vect;
        flip++;                      // カウントする
      }
      
      // 1個以上相手の石が連続しており、その先に自分の石がある場合、
      if( flip > 0 && this.bd[n] == this.turn ){
        for ( let i = 0; i < flip; i++) {  // その相手の石を自分の石にする
          this.bd[n -= vect] = this.turn;
        }
        flipdiscs += flip;           // 返した石の数を足し込む
      }
    }
    if ( flipdiscs > 0 ) {      // 打てた場合
      this.bd[p] = this.turn;   // 打ったマスを自分の石にする
      this.setNextTurn();       // 手番を変える
    }
    return flipdiscs;  
  }

  /**
   * 打ち手を変える
   */
  setNextTurn() {
    // 要修正：パスの判定が必要
    this.turn = this.turn == 2 ? 1 : 2;
  }
}

/**
 * グローバル変数
 * インスタンス用変数の初期化
 */
let gBoard = null; // Boardクラス用インスタンス
let gOthello = null; // Othelloクラス用インスタンス

/**
 * OnClickBoard 盤面に石を置く
 * @param {number} pos 0～63 0:左上, 7:右上, 8:2行目の左端, 56:左下, 63:右下
 */
function OnClickBoard( pos )　{
  let x = pos % 8;
  let y = Math.floor( pos / 8 );

  // (x,y)に打つ
  if ( gOthello.move( x, y ) > 0 ) {
    gBoard.update( gOthello );
  }
}

/**
 * setup オセロ盤をセットアップします。
 */
function setup() {

  // index.html の id="board" な div の中にオセロ盤を作成
  gBoard = new GBOARD( "board" );

  gOthello = new Othello();
  gBoard.update( gOthello );
  
}

// ページを読み込んだら、最初にsetup()を実行
window.onload = setup;