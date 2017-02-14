TXP = (function(exports) {
    exports.Utils.TextSubstitution = {
        TEXT_HEBREW: [' ','א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','מ','נ','ס','ע','פ','צ','ק','ר','ש','ת','ך','ם','ן','ף','ץ'],
        SUBSTITUTION_ATBASH: [0, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 12, 10, 9, 6, 5, 0],
        SUBSTITUTION_ALBAM: [0, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 22, 2, 3, 6, 7, 0],
        GEMATRIA_ABSOLUTE: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 20, 40, 50, 80, 90, 0],
        GEMATRIA_REDUCED: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 2, 4, 5, 8, 9, 0],
        GEMATRIA_ORDINAL: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 11, 13, 14, 17, 18, 0],
        GEMATRIA_ABSOLUTE_SOFIT: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 700, 800, 900, 0],
        GEMATRIA_REDUCED_SOFIT: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
        GEMATRIA_ORDINAL_SOFIT: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 0],
        MILUI_OPTIONS: [0,
            [[1, 12, 26]],
            [[2, 10, 22], [2, 22]],
            [[3, 10, 13, 12], [3, 13, 12]],
            [[4, 12, 22], [4, 12, 10, 22]],
            [[5, 1], [5, 10], [5, 5]],
            [[6, 6], [6, 10, 6], [6, 1, 6]],
            [[7, 10, 25]],
            [[8, 10, 22], [8, 22]],
            [[9, 10, 22], [9, 22]],
            [[10, 6, 4]],
            [[11, 26]],
            [[12, 13, 4]],
            [[13, 24]],
            [[14, 6, 25]],
            [[15, 13, 23]],
            [[16, 10, 25]],
            [[17, 1], [17, 10], [17, 5]],
            [[18, 4, 10], [18, 4, 10, 19]],
            [[19, 6, 26]],
            [[20, 10, 21], [20, 21]],
            [[21, 25], [21, 10, 25]],
            [[22, 6], [22, 10, 6], [22, 1, 6]],
            [[11, 26]],
            [[13, 24]],
            [[14, 6, 25]],
            [[19, 6, 26]],
            [[18, 4, 10], [18, 4, 10, 19]]
        ]
    };

    function GetText(data) {
        if (data.constructor === Array) {
            var str = '';
            for(var i = 0; i < data.length; i++) {
                str += exports.Utils.TextSubstitution.GetText(data[i]);
            }

            return str;

        } else {
            return  exports.Utils.TextSubstitution.TEXT_HEBREW[data];
        }
    }

    exports.Utils.TextSubstitution.GetText = GetText;

    exports.Utils.TextSubstitution.GetTextFromArray = function(word) {
      var str = '';
      for(var i = 0; i < word.length; i++) {
        str += exports.Utils.TextSubstitution.TEXT_HEBREW[word[i]];
      }

      return str;
    }

    exports.Utils.TextSubstitution.GetMilui = function(word) {
        var ret = [];

        for(var letterIndex = 0; letterIndex < word.length; letterIndex++) {
            var letter = word[letterIndex];
            if(letter == 0) {
                ret.push(0);
            } else {
                var letterMilui = exports.Utils.TextSubstitution.MILUI_OPTIONS[letter][0];
                for(var i = 0; i < letterMilui.length; i++) {
                    ret.push(letterMilui[i]);
                }
            }
        }

        return ret;
    }
    return exports;

}(TXP || {
    Utils: {},
    Shaders: {},
    Interactions: {},
    TanachData: {}
}));
