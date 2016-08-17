Various experiments with Tanach data

TODO:

Map text to an image

Could pack sequentially into bytes such that R = letter1, G = letter2, B = letter3, etc.
But it might be more fun just to use alpha channel and require big image. For Chumash alone, it doesn't need to be so big (553x552 will do it)
Actually this could be nice experiment - make a shader that uses letters as alpha channel values :)
(need to start probably with writing blend shader, i.e. how to get values of each)

GPU-powered search and transformations

A few notes from previous tests ran...

  total letter count for chumash: 304801 (matches R' Yakov Auerbach http://www.dafyomi.co.il/kidushin/insites/kd-dt-030.htm)
  total letter count for all: 1196838
