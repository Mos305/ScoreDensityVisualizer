import os
from glob import glob
import re
import pandas as pd

import sys



def update_current_bpm(line, bpm):
    """
    BPMを更新する関数

    Parameters
    ----------
    line : str
        '#BPMCHANGE'行
    bpm : float
        現在のBPM

    Returns
    -------
    float
        更新されたBPM
    bool
        その後の処理を実行するかどうか
    """
    match = re.match('#BPMCHANGE', line)
    if match:
        return float(re.sub('#BPMCHANGE', '', line)), True
    else:
        return bpm, False



def update_current_measure(line, measure):
    """
    拍子を更新する関数

    Parameters
    ----------
    line : str
        '#MEASURE'行
    bpm : float
        現在の拍子

    Returns
    -------
    float
        更新された拍子
    bool
        その後の処理を実行するかどうか
    """
    match = re.match('#MEASURE', line)
    if match:
        frac = re.sub('#MEASURE', '', line).split('/')
        return float(frac[0]) / float(frac[1]), True
    else:
        return measure, False
    
    
    
def update_current_score(line):
    """
    譜面行で末尾が閉じられていない場合に，その部分を抽出する関数

    Parameters
    ----------
    line : str
        譜面行

    Returns
    -------
    str
        抽出した譜面行
    """
    match = re.match(r'[0-9]+', line)
    if match:
        return match.group()
    else:
        return ''
    


def calc_density(line, score, bpm, measure):
    """
    密度を計算する関数

    Parameters
    ----------
    line : str
        譜面行
    score : str
        その小節が複数行にまたがっていた場合のそれまでの譜面行
    bpm : float
        BPM
    measure : float
        拍子

    Returns
    -------
    list[float, float, float, float, float str]
        計算結果とその補助情報
        形式：
            ドンの密度
            カツの密度
            ドン＋カツの密度
            BPM
            拍子
            譜面
    str
        それまでストックしていた譜面行をリセットするための空文字
    bool
        その後の処理を実行するかどうか
    """
    match = re.match(r'[0-9]+,', line)
    if match:
        # ドン，カツの数をカウント
        score += match.group()
        count_don = float(score.count('1') + score.count('3'))
        count_ka = float(score.count('2') + score.count('4'))
        count_all = count_don + count_ka
        # その小節の長さ（秒数）を計算
        bar_len = 240.0 / bpm * measure
        # 密度を計算して返す
        return [count_don / bar_len, count_ka / bar_len, count_all / bar_len, bpm, measure, score], '', True
    else:
        return [0.0, 0.0, 0.0, None, None, None], score, False

    
    
if __name__ == '__main__':
    
    # コマンドライン引数からファイルパスを取得
    path = sys.argv[1]
    
    # ファイル読み込み
    with open(path, 'r', encoding='shift_jis') as f:
        lines = f.readlines()
    
    # BPMと拍子の初期値を設定
    current_bpm = float(re.sub('BPM:', '', [line for line in lines if re.search('BPM:', line) is not None][0]))   # ヘッダのBPM値を抽出
    current_measure = float(4.0 / 4.0)
    
    # 譜面部分を抽出
    stt_line_idx = [i for i, line in enumerate(lines) if re.search('#START', line) is not None][0]
    end_line_idx = [i for i, line in enumerate(lines) if re.search('#END', line) is not None][0]
    scorelines = lines[stt_line_idx + 1:end_line_idx]
    
    # 密度を計算する
    score = ''
    lst_rate = []
    for line in scorelines:
        is_continue = False

        # BPM，拍子を更新
        current_bpm, is_continue = update_current_bpm(line, current_bpm)
        if is_continue:
            continue
        current_measure, is_continue = update_current_measure(line, current_measure)
        if is_continue:
            continue

        # 割合を計算
        density, score, is_continue = calc_density(line, score, current_bpm, current_measure)
        if is_continue:
            lst_rate.append(density)
            continue

        # 途中までの譜面行をストック
        score += update_current_score(line)
        
    # 計算結果をCSV出力
    pd.DataFrame(lst_rate, columns=['don_density', 'ka_density', 'all_density', 'bpm', 'measure', 'score']).to_csv('df_density.csv', index=False)
    
    print('Finish!')