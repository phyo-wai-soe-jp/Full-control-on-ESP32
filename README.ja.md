# Full Control on ESP（日本語版）

**MicroFan ESP32-C3M-TRY（4 MB）** ボード向けの、リモート操作とライブ環境モニタリングのプロジェクトです。Web ダッシュボードから送信されたコマンドは Cloudflare Worker を経由して **EMQX Cloud の MQTT ブローカー** に送られます。ESP32 は常時 MQTT に接続しており、コマンドを即座に反映するとともに、自身の状態（LED、サーボ、音、センサー）を継続的に配信し、ダッシュボードにリアルタイムで表示します。

ファームウェアの書き込み後は、ボードは電源供給に USB があれば十分です。ダッシュボードはインターネットに接続されたスマートフォンや PC からどこからでも開くことができます。ルーターのポート開放は不要です。

## このプロジェクトができること

- ESP32-C3M-TRY を 2.4 GHz の Wi-Fi ネットワークに接続し、TLS 経由で EMQX Cloud の MQTT ブローカーに接続します。
- カラーホイールと明るさスライダーによるフルカラーの LED 制御（固定色だけでなく任意の色を指定可能）。全 LED または個別の LED を対象にでき、時間指定での自動消灯にも対応します。
- 「ランダムカラー」モードと、全 LED を即座に消灯する「消灯」ボタン。
- サーボ制御：直接角度指定（0～180°）、往復するスイープパターン、ハンマーのように打撃するストライクパターン。
- 圧電スピーカーで任意のトーン、またはメロディーに合わせて LED が光る内蔵の 5 曲を再生。
- 基板上の SSD1306 OLED ディスプレイに、Wi-Fi/MQTT の状態とは独立して、気温・湿度（AHT21）と周囲の明るさ（フォトトランジスタ）をリアルタイム表示。
- Web ダッシュボードはボードの現在の状態（LED の色、サーボ角度、音・曲、センサー値）をリアルタイムに表示します。閲覧に PIN は不要で、コマンドの送信のみ PIN が必要です。
- 日本語・英語のバイリンガル UI（画面上部のボタンで切り替え）。
- ルーターのポート開放は不要で、ESP32 側に外部からアクセス可能なポートは一切ありません（すべて ESP32 からの発信接続のみ）。

## ハードウェア

| 基板の部品 | ESP32-C3 の GPIO | 備考 |
| --- | ---: | --- |
| WS2812 カラー LED 3 個（LED10～LED12） | 10 | 1 本の信号線で 3 個の LED をチェーン接続で制御します。 |
| 圧電スピーカー（SOUNDER） | 21 | PWM（`ledcWriteTone`）で駆動。音・曲コマンド実行中以外は無音を維持します。 |
| サーボコネクタ CN3 | 7 | サーボの信号線。CN3 には 5V と GND も供給されます。 |
| OLED ディスプレイ + I2C バス | SDA 8 / SCL 9 | AHT21 温湿度センサーと共用の I2C バス。SSD1306、128×64、アドレス `0x3C`。 |
| フォトトランジスタ（明るさセンサー） | 1 | ADC（`analogRead`）で読み取り、0～1 に正規化します。 |
| 内蔵の単色 LED（LED1） | 0 | 現在のファームウェアでは未使用です。 |
| SW1 / SW2 / SW3 | 2 / 3 / 6 | 負論理のボタン。現在のファームウェアでは読み取っていません。 |
| SW4 / BOOT | 9 | I2C の SCL と共用のため、I2C 使用中は一般的な入力として転用しないでください。 |

## プロジェクトの構成

```text
full control on ESP/
├── README.md                 このガイド（英語版）
├── README.ja.md              このガイドの日本語版
├── platformio.ini            PlatformIO のボード／ビルド／書き込み設定
├── src/
│   └── main.cpp              ESP32 の Arduino ファームウェア（Wi-Fi、MQTT、LED、サーボ、音、OLED、センサー）
└── cloudflare/
    ├── wrangler.toml         Cloudflare Worker の設定（環境変数、Durable Object バインディング）
    ├── src/worker.js         コマンド中継とライブ状態 API（Worker + Durable Object）
    └── web/                  スマートフォン／PC 用ダッシュボード
        ├── index.html
        ├── app.js
        └── style.css
```

## 仕組み

**コマンドの流れ（ダッシュボード → ボード）：**

```text
ダッシュボード ──POST /api/command（PIN 必須）──▶  Cloudflare Worker
                                                        │  検証後、EMQX へパブリッシュ（retain 付き、QoS 1）
                                                        ▼
                                              EMQX Cloud の MQTT ブローカー
                                                        │  トピック: esp32/command
                                                        ▼
                                        ESP32-C3M-TRY（MQTT に常時接続）
```

ESP32 は MQTT セッションを常時維持しているため、コマンドはミリ秒単位で即座に反映されます（ポーリングの遅延はありません）。「retain（保持）」フラグにより、再起動・再接続したボードは直前のコマンドを接続直後に受け取ります。

**状態の流れ（ボード → ダッシュボード）：**

```text
ESP32-C3M-TRY  ──約250msごとにパブリッシュ──▶  EMQX Cloud（トピック: esp32/state）
                                                   │  ルールエンジン → Webhook
                                                   ▼
                                     Cloudflare Worker → Durable Object
                                                   │  GET /api/state（PIN 不要）
                                                   ▼
                                              ダッシュボード（約400msごとにポーリング）
```

Durable Object を使用しているのは、Cloudflare の通常のエッジキャッシュがデータセンターごとに独立しているためです。これがないと、EMQX Cloud のサーバーから書き込まれた状態と、ブラウザに最も近いエッジから読み取られる状態が、別々の同期されていないキャッシュに保存されてしまう可能性があります。Durable Object を使うことで、どのリクエストからも常に同じ一貫したデータを参照できます。

ライブ状態（LED の色、サーボ角度、音・曲、センサー値）はテレメトリ（読み取り専用の情報）に過ぎないため、意図的に PIN なしで閲覧できるようにしています。PIN が必要なのは `/api/command`（ボードを操作するすべての操作）のみです。そのため、ダッシュボードを見るだけならロック解除は不要ですが、PIN がなければ何も操作はできません。

## ダッシュボードを開く

デプロイした Worker の URL をブラウザで開いてください。ライブシミュレーションバーとセンサーバーはすぐに表示され、閲覧するだけなら PIN は不要です。いずれかの操作をタップすると、そのブラウザタブ・セッションにつき 1 回、6 桁のダッシュボード PIN の入力を求められます。

ダッシュボードでは以下が行えます：

- **ライトタブ：** LED の対象（全部／LED 1／LED 2／LED 3）、カラーホイールと縦の明るさスライダーによるフルカラー指定、時間指定の自動消灯用スライダー、「ランダムカラー」、「消灯」。
- **サーボタブ：** ダイヤルによる直接角度指定（0～180°）、スイープパターン（開始・終了角度、刻み幅、速度、回数）、ストライクパターン（低角度・高角度、速度、回数）。
- **サウンドタブ：** 周波数・長さを指定できるトーン生成と、ビープ・アラート・チャイムのプリセット。
- **曲タブ：** LED がメロディーに合わせて光る短いブザー曲 5 曲（Perfect、きらきら星、Happy Birthday、エリーゼのために、スーパーマリオブラザーズのテーマ）。
- **ライブシミュレーションバー：** ボードの実際の LED の色、サーボ角度、音・曲の再生状況をリアルタイムに表示。直近 1.5 秒以内に報告がない場合は「オフライン」バッジを表示します。
- **センサーバー：** 気温・湿度・明るさをリアルタイム表示。オフライン表示の仕組みは同じです。
- **言語切り替え：** UI 全体を英語と日本語で切り替えます。

### サーボの配線

サーボは **CN3** に接続します。信号線は GPIO 7 で、隣に 5V と GND があります。小型サーボであれば基板の USB 電源で動作することもありますが、大型サーボの場合は別途安定化された 5V 電源が必要です。外部電源を使う場合は、必ず外部電源の GND と ESP32 の GND を接続してください。

## ファームウェアの設定

`src/main.cpp` 内の以下の値を、ご自身のネットワークと EMQX Cloud のデプロイメントに合わせて設定してください。

```cpp
const char *wifiName = "YOUR_WIFI_NAME";
const char *wifiPassword = "YOUR_WIFI_PASSWORD";

const char *mqttHost = "YOUR_DEPLOYMENT.ala.REGION.emqxsl.com";
const char *mqttUser = "YOUR_MQTT_USERNAME";
const char *mqttPassword = "YOUR_MQTT_PASSWORD";
```

ESP32-C3 は 2.4 GHz の Wi-Fi のみに対応しています。スマートフォンのテザリングを使う場合は、2.4 GHz／互換モードがあれば有効にしてください。

### 状態表示 LED の色

| LED の色 | 意味 |
| --- | --- |
| 青 | Wi-Fi に接続中です。 |
| 紫 | Wi-Fi への接続に失敗しました。ネットワーク名、パスワード、2.4 GHz 対応を確認してください。 |
| 黄 | Wi-Fi は接続済みですが、MQTT ブローカーに接続できません。 |
| 指定した色／消灯 | すべて正常に接続されており、最後に受信したコマンドの状態を表示しています。 |

## VS Code でのビルドと書き込み

1. PlatformIO 拡張機能をインストールした VS Code で **full control on ESP** フォルダを開きます。
2. USB-C ケーブルでボードを接続します。
3. PlatformIO で環境 `esp32-c3-devkitm-1` を選択します。
4. **Upload（アップロード）** を実行します（必要なライブラリは自動的に取得されます）。
5. 書き込み完了後、ボードは再起動し、Wi-Fi と MQTT ブローカーに接続します。

使用しているライブラリ（`platformio.ini` に記載、PlatformIO が自動インストール）：

- `adafruit/Adafruit NeoPixel` — 基板上の WS2812 LED 3 個の制御
- `madhephaestus/ESP32Servo` — サーボ制御
- `knolleary/PubSubClient` — MQTT クライアント
- `adafruit/Adafruit SSD1306` + `adafruit/Adafruit GFX Library` — OLED ディスプレイ
- `adafruit/Adafruit AHTX0` — AHT21 温湿度センサー

シリアルポートが変わった場合は、`platformio.ini` の `upload_port` を更新または削除し、検出された USB ポートを選択してください。

### シリアルモニタ

ボーレートは 115200 です。ファームウェアは Wi-Fi の接続状況、ローカル IP アドレス、MQTT の接続・切断メッセージを出力します。

## Cloudflare Worker と EMQX Cloud の設定

### 1. EMQX Cloud のデプロイメント

1. [EMQX Cloud](https://www.emqx.com/en/cloud) で Serverless タイプのデプロイメントを作成します。MQTT のホスト名と TLS ポート（`8883`）を控えておきます。
2. **アクセス制御 → 認証** で、ESP32 用の MQTT ユーザー名・パスワードを作成します。
3. デプロイメント概要画面で **デプロイメント API キー**（App ID + App Secret）を作成します。これは Worker がコマンドを HTTP API 経由でパブリッシュするために使用します。
4. **データ統合** で、Worker の `/api/state/mqtt` エンドポイントを指す **HTTP サービス** コネクターを作成します（TLS を有効にし、共有シークレットトークンを含むカスタムヘッダーを設定）。続けて、SQL を `SELECT payload FROM "esp32/state"` としたルールを作成し、そのコネクターを使うアクション（Body テンプレートは `${payload}`）を設定します。これにより、ボードがパブリッシュする状態メッセージが Worker へ転送されます。

### 2. Cloudflare Worker

1. Cloudflare Worker を作成します（`cloudflare/` ディレクトリで `wrangler deploy`）。
2. `cloudflare/wrangler.toml` の `[vars]` に `EMQX_API_BASE` と `EMQX_COMMAND_TOPIC` を設定します（これらはシークレットではなく、単なる設定値です）。
3. 以下の Worker シークレットを設定します（`wrangler secret put <NAME>`、ソース管理には絶対にコミットしないでください）：

   ```text
   EMQX_API_KEY        = EMQX Cloud デプロイメントの API キー（App ID）
   EMQX_API_SECRET     = EMQX Cloud デプロイメントの API シークレット
   EMQX_WEBHOOK_TOKEN  = 任意のランダムなトークン（EMQX の Webhook に設定したヘッダーの値と一致させる）
   DASHBOARD_PIN       = 非公開の 6 桁ダッシュボード PIN
   ```

4. Durable Object のバインディング（`STATE` → `StateStore`）とそのマイグレーションは、すでに `wrangler.toml` に記載済みです。デプロイ以外の追加設定は不要です。
5. デプロイ：`cloudflare/` ディレクトリで `wrangler deploy` を実行します。

## セキュリティに関する注意

- Wi-Fi のパスワード、MQTT のユーザー名・パスワード、`EMQX_API_KEY`／`EMQX_API_SECRET`、`EMQX_WEBHOOK_TOKEN`、`DASHBOARD_PIN` はすべて非公開の認証情報として扱ってください。
- これらをスクリーンショット、チャット、公開リポジトリに投稿しないでください。
- 現在のファームウェアには、この動作環境用のローカルな Wi-Fi・MQTT 認証情報が含まれています。プロジェクトを共有する前に、プレースホルダーに置き換えてください。
- `/api/state`（LED・サーボ・音・センサーのライブ情報）は意図的に PIN なしで読み取り可能にしています。ボードを操作できる `/api/command` のみ PIN が必要です。
- EMQX の API キーや MQTT パスワードが誤って公開された場合は、速やかにローテーション（再発行）してください。
- このプロジェクトでは ESP32 を直接ルーターのポート開放で公開しないでください。ESP32 は Wi-Fi と MQTT ブローカーへの発信接続のみを行う設計になっており、これがより安全な方式です。

## トラブルシューティング

### LED が青いまま変わらない

ボードが Wi-Fi への接続を試みている状態です。ネットワークが起動しているか、2.4 GHz であるか、`main.cpp` 内のネットワーク名・パスワードが正しいかを確認してください。Wi-Fi 設定を変更した後は、一度 **RST** ボタンを押してください。

### LED が紫になる

Wi-Fi への接続に失敗しています。Wi-Fi の設定と、スマートフォンテザリングの互換モードを再確認してください。

### LED が黄色になる

Wi-Fi には接続できていますが、MQTT ブローカーに到達できていません。`mqttHost`／`mqttUser`／`mqttPassword` の値、EMQX デプロイメントが稼働しているか、EMQX コンソール上で MQTT の認証情報が無効化・変更されていないかを確認してください。

### ボードは接続されているのにダッシュボードが「オフライン」と表示される

EMQX のルールエンジンの Webhook（データ統合）を確認してください。URL の設定が間違っていたり、共有トークンが `EMQX_WEBHOOK_TOKEN` と一致していない場合、状態メッセージが Worker の Durable Object に届かないため、デバイス自体はオンラインでもダッシュボードには最新情報が表示されません。

### ブザーが意図せず鳴る

圧電スピーカーは GPIO 21 に接続されており、`sound`／`song` コマンドの実行中のみ有効になる専用の PWM チャンネルで駆動されています。それ以外のタイミングで鳴る場合は、GPIO 21 やその PWM チャンネルに書き込む他のコードがないか確認してください。

## ファームウェアの主な動作

- 状態はおよそ 250ms ごとに MQTT へパブリッシュされます。OLED のセンサー表示は 1 秒ごとに更新されます（AHT21 のサンプリングはこれ以上速くする必要はありません）。
- 各コマンドには ID が付与されており、ボードは同じ（retain された）コマンドを重複して適用しません。
- 時間指定の点灯やサーボパターンは `millis()` を使用しており、MQTT／Wi-Fi の処理をブロックしません。
- ランダムモードは独立して動作し、500ms ごとに 1 個の LED の色を変更します。
- 起動時はすべての LED が消灯した状態です。

## 参考資料

- [MicroFan ESP32-C3M-TRY 取扱説明書](https://www.microfan.jp/document/ESP32-C3M-TRY-R1-20230701.pdf)
- [MicroFan ESP32-C3M-TRY MicroPython ガイド](https://www.microfan.jp/2023/08/esp32-c3m-try-micropython/)
- [EMQX Cloud ドキュメント](https://docs.emqx.com/en/cloud/latest/)
