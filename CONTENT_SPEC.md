# CONTENT_SPEC — 統計検定準1級 範囲表カバレッジ表

出典: 統計検定準1級 範囲表（2018年6月28日版, `grade1semi_hani_190628_2.pdf`）。
凡例: ✅=実装済み / 🟡=部分的（拡充対象） / 🆕=新規追加 / セル内は該当トピックid。

> **状態（2026-07-05）**: 下表の 🆕・🟡 は全て実装完了。範囲表の全大項目をカバー（計85トピック）。
> 各トピックは「本文 → インタラクティブ/静的グラフ → まとめ（keypoints）→ 確認問題（quiz, 選択式・解説つき）」で自己完結。
> 学習コンテンツ（まとめ・例題・確認問題）は `content/quiz-*.js` に `window.STATS_QUIZ["section/id"]` として定義。

## 確率と確率変数
| 小項目 | 主な用語 | 状態 | トピック |
|---|---|---|---|
| 事象と確率 | 確率の計算, 統計的独立, 条件付き確率, ベイズの定理, 包除原理 | 🆕 | `prep1/events-probability`, `prep1/conditional-bayes` |
| 確率分布と母関数 | 確率(密度)関数, 同時/周辺/条件付き, 累積分布関数, 生存関数, モーメント母関数, 確率母関数 | 🆕 | `prep1/random-variables`, `prep1/joint-distribution`, `prep1/mgf` |
| 分布の特性値 | モーメント, 歪度, 尖度, 変動係数, 相関係数, 偏相関係数, 分位点関数, 条件つき期待値/分散 | 🟡🆕 | `prep1/moments-shape`, `prep1/partial-correlation`, ✅`prep1/correlation` |
| 変数変換 | 変数変換, 確率変数の線形結合の分布 | 🆕 | `prep1/transformations` |
| 極限定理・漸近理論 | 大数の法則, 少数法則, 中心極限定理, 極値分布, 正規近似, 連続修正, デルタ法 | 🟡🆕 | ✅`prep1/clt`, ✅`prep1/delta-method`, 🆕`prep1/lln`, 🆕`prep1/normal-approx` |

## 種々の確率分布
| 小項目 | 用語 | 状態 | トピック |
|---|---|---|---|
| 離散型分布 | 離散一様, ベルヌーイ, 二項, 超幾何, ポアソン, 幾何, 負の二項, 多項 | 🆕 | `prep1/discrete-distributions` |
| 連続型分布 | 連続一様, 正規, 指数, ガンマ, ベータ, コーシー, 対数正規, 多変量正規 | 🆕 | `prep1/continuous-distributions`, `prep1/multivariate-normal` |
| 標本分布 | t分布, カイ二乗, F分布(非心含む) | ✅ | `prep1/distributions` |

## 統計的推測（推定）
| 小項目 | 用語 | 状態 | トピック |
|---|---|---|---|
| 統計量 | 十分統計量, ネイマンの分解定理, 順序統計量 | 🆕 | `prep1/sufficiency`, `prep1/order-statistics` |
| 各種推定法 | 最尤法, モーメント法, 最小二乗法, 線形模型 | 🟡🆕 | ✅`prep1/mle`, 🆕`prep1/moment-method`, ✅`prep1/regression` |
| 点推定の性質 | 不偏性, 一致性, 十分性, 有効性, 相対効率, ガウス・マルコフ, クラーメル・ラオ | 🆕 | `prep1/estimator-properties`, `prep1/cramer-rao` |
| 漸近的性質 | フィッシャー情報量, 漸近正規性, デルタ法, ジャックナイフ, KL情報量 | 🟡🆕 | `prep1/fisher-information`, ✅`prep1/delta-method` |
| 区間推定 | 信頼係数, 信頼区間の構成, 被覆確率, 片側信頼限界 | ✅ | `prep1/confidence` |

## 統計的推測（検定）
| 小項目 | 用語 | 状態 | トピック |
|---|---|---|---|
| 検定の基礎 | 仮説, P値, 棄却域, 過誤, 検出力(曲線), サンプルサイズ決定, 多重比較 | 🟡🆕 | ✅`prep1/testing`, 🆕`prep1/sample-size`, 🆕`prep1/multiple-comparison` |
| 検定法の導出 | ネイマン・ピアソン, 尤度比検定, ワルド型, スコア検定, 正確検定 | 🆕 | `prep1/neyman-pearson`, `prep1/three-tests` |
| 正規分布に関する検定 | 母平均/母分散/2標本/母相関係数 | 🆕 | `prep1/normal-tests` |
| 一般の分布に関する検定 | 二項, ポアソン, 適合度検定 | 🟡🆕 | 🆕`prep1/goodness-of-fit`, ✅`prep1/contingency` |
| ノンパラメトリック法 | ウィルコクソン, 並べ替え, 符号付き順位, クラスカル・ウォリス, 順位相関 | ✅ | `prep1/nonparametric` |

## マルコフ連鎖と確率過程の基礎
| 小項目 | 用語 | 状態 | トピック |
|---|---|---|---|
| マルコフ連鎖 | 推移確率, 既約性, 再帰性, 定常分布 | 🆕 | `prep1/markov-chain` |
| 確率過程の基礎 | ランダムウォーク, ポアソン過程, ブラウン運動 | 🆕 | `prep1/stochastic-process` |

## 回帰分析
| 小項目 | 用語 | 状態 | トピック |
|---|---|---|---|
| 重回帰分析 | 重回帰, 変数選択, 残差分析, 一般化最小二乗, 多重共線性, L₁正則化 | 🟡🆕 | ✅`multiple-regression`, ✅`multicollinearity`, 🆕`prep1/regularization` |
| 回帰診断法 | 系列相関, DW比, はずれ値, leverage, Q-Qプロット | 🆕 | `prep1/regression-diagnostics` |
| 質的回帰 | ロジスティック回帰, プロビット分析 | 🟡🆕 | ✅`logistic`, 🆕含む`prep1/glm` |
| その他 | 一般化線形モデル, 打ち切り, 比例ハザード, ニューラルネット | 🆕 | `prep1/glm`, `prep1/survival` |

## 分散分析と実験計画法
| 用語 | 状態 | トピック |
|---|---|---|
| 一元/二元配置, 分散分析表, 交互作用, ブロック化, 乱塊法, 一部実施要因計画, 直交配列, ブロック計画 | 🟡🆕 | ✅`principles/anova1/interaction/orthogonal`, 🆕`prep1/blocking-designs` |

## 標本調査法
| 用語 | 状態 | トピック |
|---|---|---|
| 有限母集団, 有限修正, 各種標本抽出法 | 🆕 | `prep1/sampling-survey` |

## 多変量解析
| 小項目 | 用語 | 状態 | トピック |
|---|---|---|---|
| 主成分分析 | 主成分スコア/負荷量, 寄与率, 累積寄与率 | ✅ | `prep1/pca` |
| 判別分析 | フィッシャー線形判別, 2次判別, SVM, 正準判別, ROC, AUC, 混同行列 | 🟡🆕 | ✅`lda`, 🆕`prep1/svm`, 🆕`prep1/roc-auc` |
| クラスター分析 | 階層型/デンドログラム, k-means, 距離行列 | ✅ | `clustering`, `kmeans` |
| 共分散構造分析と因子分析 | パス解析, 因果図, 潜在変数, 因子の回転 | 🟡🆕 | ✅`factor`, 🆕`prep1/path-analysis` |
| その他 | 多次元尺度法, 正準相関, 対応分析, 数量化法 | 🆕 | `prep1/mds-ca` |

## 時系列解析
| 用語 | 状態 | トピック |
|---|---|---|
| 自己相関, 偏自己相関, ペリオドグラム, ARIMA, 定常性, 階差, 状態空間モデル | 🟡🆕 | ✅`timeseries`(基礎), 🆕`prep1/acf-pacf`, 🆕`prep1/arima` |

## 分割表
| 小項目 | 用語 | 状態 | トピック |
|---|---|---|---|
| 分割表の解析 | オッズ比, 連関係数, ファイ係数, 残差分析 | 🟡🆕 | ✅`contingency`, 🆕`prep1/odds-ratio` |
| 分割表のモデル | 対数線形モデル, 階層モデル, 条件つき独立性, グラフィカルモデル | 🆕 | `prep1/log-linear` |

## 欠測値 / モデル選択 / ベイズ / シミュレーション
| 大項目 | 用語 | 状態 | トピック |
|---|---|---|---|
| 欠測値 | 欠測メカニズム(MCAR/MAR/MNAR), EMアルゴリズム | 🆕 | `prep1/missing-data` |
| モデル選択 | 情報量規準, AIC, cross validation | ✅ | `model-selection`, `crossval` |
| ベイズ法 | 事前/事後, 階層ベイズ, ギブス, MH法 | 🟡🆕 | ✅`bayes`, 🆕`prep1/mcmc` |
| シミュレーション | ジャックナイフ, ブートストラップ, 乱数, 棄却法, モンテカルロ, MCMC | 🟡🆕 | ✅`bootstrap`, 🆕`prep1/monte-carlo`, 🆕`prep1/mcmc` |

---
準1級範囲外（+α）: 実験計画法の応用（CCD/BoxBehnken/D最適/RSM/ロバスト）は `doe` セクション、ケモメトリクス（PLS/PLS-DA/OPLS-DA）は `chemo` セクション。準1級と重なる基礎ANOVA等は `prep1` に集約済み。
