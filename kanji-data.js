/* Kaidoku codex data.
 *
 * Factual fields (meanings, on/kun readings, stroke_count, grade, jlpt) follow the
 * schema kanjiapi.dev serves at GET /v1/kanji/{character}, which is built on KANJIDIC2
 * (Electronic Dictionary Research and Development Group, CC BY-SA). Vocabulary follows
 * JMdict from the same group. Both are attribution-share-alike; credit EDRDG if shipped.
 *
 * `level`, `parts` and `mnemonic` are Kaidoku's own — the progression order and the
 * mnemonic stories are original to this project and are not derived from any other
 * kanji application. Refreshing from the API overwrites only the factual fields.
 */

export const RADICALS = [
  { c: '一', m: 'ground', level: 1, mn: 'A single horizontal stroke: the ground you stand on, and the line every other character is built above.' },
  { c: '二', m: 'two', level: 1, mn: 'Two lines of ground, stacked. Two of anything.' },
  { c: '人', m: 'person', level: 1, mn: 'A figure seen from the front, mid-stride: two legs and no arms to speak of.' },
  { c: '大', m: 'big', level: 1, mn: 'A person standing with both arms flung wide to show you how big the fish was.' },
  { c: '口', m: 'mouth', level: 1, mn: 'An open mouth drawn as a plain square. It is also any hole, opening or entrance.' },
  { c: '日', m: 'sun', level: 1, mn: 'A mouth with a line through it: the sun with a cloud across its face. Also a day.' },
  { c: '月', m: 'moon', level: 1, mn: 'A crescent moon tipped on its side, with two lines of shadow. Also a month.' },
  { c: '木', m: 'tree', level: 1, mn: 'A trunk with two branches and two roots. Nothing more than a tree.' },
  { c: '山', m: 'mountain', level: 1, mn: 'Three peaks on a common base, the middle one highest.' },
  { c: '川', m: 'river', level: 1, mn: 'Three lines of water running downhill between two banks.' },
  { c: '火', m: 'fire', level: 1, mn: 'A person with sparks flying off both shoulders. This is fire, and it is going badly.' },
  { c: '水', m: 'water', level: 1, mn: 'A stream splitting around a stone in the middle of it.' },
  { c: '土', m: 'earth', level: 1, mn: 'A cross planted in the ground: a mound of earth with a stake through it.' },
  { c: '十', m: 'cross', level: 1, mn: 'Two strokes crossing. Ten, and any cross or crossing.' },

  { c: '田', m: 'rice field', level: 2, mn: 'A mouth divided into four plots by a cross: a flooded paddy seen from above.' },
  { c: '目', m: 'eye', level: 2, mn: 'An eye stood on its end, the iris drawn as two lines across it.' },
  { c: '手', m: 'hand', level: 2, mn: 'A wrist and three fingers, drawn in haste.' },
  { c: '立', m: 'stand', level: 2, mn: 'A person planted on the ground with arms out for balance: standing.' },
  { c: '白', m: 'white', level: 2, mn: 'The sun with a ray coming off the top of it, bleaching everything white.' },
  { c: '子', m: 'child', level: 2, mn: 'A swaddled infant: a big head, arms out, and no legs in evidence.' },
  { c: '女', m: 'woman', level: 2, mn: 'A figure seated with legs crossed and arms folded across the lap.' },
  { c: '力', m: 'power', level: 2, mn: 'An arm bent to show the muscle. Power, force, strength.' },

  { c: '艹', m: 'grass', level: 3, mn: 'Two shoots pushing up through a common line. It sits on the head of anything that grows.' },
  { c: '宀', m: 'roof', level: 3, mn: 'A ridge with two eaves coming down. Whatever appears beneath it is indoors.' },
  { c: '夕', m: 'evening', level: 3, mn: 'The moon with one of its shadow lines rubbed out: the moon only half risen, so, evening.' },
  { c: '儿', m: 'legs', level: 3, mn: 'Two legs and nothing above them. It props up characters about people and precedence.' },
  { c: '工', m: 'craft', level: 3, mn: 'A carpenter\u2019s square: two lines of ground joined by an upright. Construction, craft, work.' },
  { c: '冂', m: 'borders', level: 3, mn: 'Three sides of a box with the bottom left open: an enclosure, a boundary drawn round something.' },

  { c: '寺', m: 'temple', level: 4, mn: 'Earth above and a measure below: the plot of ground a temple is raised on.' },
  { c: '刀', m: 'blade', level: 4, mn: 'A short curved stroke with a handle: a knife seen edge-on.' },
  { c: '門', m: 'gate', level: 4, mn: 'Two tall doors facing each other, hinges outward. A gate.' },
  { c: '匕', m: 'spoon', level: 4, mn: 'A bent handle with a scoop at the end.' },
  { c: '亠', m: 'lid', level: 4, mn: 'A flat line with a knob on top: a lid set over whatever follows.' },

  { c: '言', m: 'speech', level: 5, mn: 'A mouth with lines of sound stacked above it, and a lid over the lot: words coming out in order.' },
  { c: '舌', m: 'tongue', level: 5, mn: 'A mouth with something thrusting out of it. The tongue.' },
  { c: '耳', m: 'ear', level: 5, mn: 'An ear drawn as a narrow field turned on its side, with the lobe hanging below.' },
  { c: '聿', m: 'brush', level: 5, mn: 'A hand gripping an upright shaft with three lines of bristle: a writing brush held to the page.' }
];

export const KANJI = [
  { c: '一', meanings: ['one'], on: ['イチ', 'イツ'], kun: ['ひと-'], strokes: 1, grade: 1, jlpt: 5, level: 1, parts: ['ground'], mn: 'The ground, and one line of it. One.' },
  { c: '二', meanings: ['two'], on: ['ニ', 'ジ'], kun: ['ふた-'], strokes: 2, grade: 1, jlpt: 5, level: 1, parts: ['two'], mn: 'Two lines of ground: two.' },
  { c: '三', meanings: ['three'], on: ['サン'], kun: ['み-', 'みっ-'], strokes: 3, grade: 1, jlpt: 5, level: 1, parts: ['ground', 'two'], mn: 'One line added to two. The pattern stops here \u2014 four is not four lines.' },
  { c: '人', meanings: ['person', 'people'], on: ['ジン', 'ニン'], kun: ['ひと'], strokes: 2, grade: 1, jlpt: 5, level: 1, parts: ['person'], mn: 'The component and the character are the same figure: a person.' },
  { c: '大', meanings: ['big', 'large', 'great'], on: ['ダイ', 'タイ'], kun: ['おお-'], strokes: 3, grade: 1, jlpt: 5, level: 1, parts: ['big'], mn: 'A person with arms wide: big.' },
  { c: '山', meanings: ['mountain'], on: ['サン'], kun: ['やま'], strokes: 3, grade: 1, jlpt: 5, level: 1, parts: ['mountain'], mn: 'Three peaks. In place names it is read やま far more often than サン.' },
  { c: '川', meanings: ['river', 'stream'], on: ['セン'], kun: ['かわ'], strokes: 3, grade: 1, jlpt: 5, level: 1, parts: ['river'], mn: 'Water between two banks: a river.' },
  { c: '口', meanings: ['mouth', 'opening'], on: ['コウ', 'ク'], kun: ['くち'], strokes: 3, grade: 1, jlpt: 5, level: 1, parts: ['mouth'], mn: 'A mouth, and by extension any opening \u2014 an entrance, a crater, a port.' },
  { c: '日', meanings: ['sun', 'day'], on: ['ニチ', 'ジツ'], kun: ['ひ', '-か'], strokes: 4, grade: 1, jlpt: 5, level: 1, parts: ['sun'], mn: 'The sun, and therefore the day it measures. Counting days uses -か.' },
  { c: '月', meanings: ['moon', 'month'], on: ['ゲツ', 'ガツ'], kun: ['つき'], strokes: 4, grade: 1, jlpt: 5, level: 1, parts: ['moon'], mn: 'The moon, and therefore the month it measures.' },
  { c: '木', meanings: ['tree', 'wood'], on: ['モク', 'ボク'], kun: ['き'], strokes: 4, grade: 1, jlpt: 5, level: 1, parts: ['tree'], mn: 'A tree, and the wood cut from it.' },
  { c: '火', meanings: ['fire'], on: ['カ'], kun: ['ひ'], strokes: 4, grade: 1, jlpt: 5, level: 1, parts: ['fire'], mn: 'The person with sparks flying: fire.' },
  { c: '水', meanings: ['water'], on: ['スイ'], kun: ['みず'], strokes: 4, grade: 1, jlpt: 5, level: 1, parts: ['water'], mn: 'The stream splitting round a stone: water.' },
  { c: '土', meanings: ['earth', 'soil', 'ground'], on: ['ド', 'ト'], kun: ['つち'], strokes: 3, grade: 1, jlpt: 5, level: 1, parts: ['earth'], mn: 'Earth and soil. It also names Saturday, the day of earth.' },

  { c: '上', meanings: ['above', 'up', 'over'], on: ['ジョウ', 'ショウ'], kun: ['うえ', 'あ-', 'のぼ-'], strokes: 3, grade: 1, jlpt: 5, level: 2, parts: ['ground', 'cross'], mn: 'A stroke standing above the ground line: above, up, on top of.' },
  { c: '下', meanings: ['below', 'down', 'under'], on: ['カ', 'ゲ'], kun: ['した', 'さ-', 'くだ-'], strokes: 3, grade: 1, jlpt: 5, level: 2, parts: ['ground', 'cross'], mn: 'The same figure inverted: a stroke hanging below the line.' },
  { c: '中', meanings: ['middle', 'inside', 'centre'], on: ['チュウ'], kun: ['なか'], strokes: 4, grade: 1, jlpt: 5, level: 2, parts: ['mouth', 'cross'], mn: 'A line driven straight through the middle of a mouth: the centre, the inside.' },
  { c: '女', meanings: ['woman', 'female'], on: ['ジョ', 'ニョ'], kun: ['おんな'], strokes: 3, grade: 1, jlpt: 5, level: 2, parts: ['woman'], mn: 'The seated figure: woman.' },
  { c: '子', meanings: ['child'], on: ['シ', 'ス'], kun: ['こ'], strokes: 3, grade: 1, jlpt: 5, level: 2, parts: ['child'], mn: 'The swaddled infant: child. It ends countless surnames and nouns as -こ.' },
  { c: '力', meanings: ['power', 'strength', 'force'], on: ['リョク', 'リキ'], kun: ['ちから'], strokes: 2, grade: 1, jlpt: 4, level: 2, parts: ['power'], mn: 'The bent arm: power.' },
  { c: '本', meanings: ['book', 'origin', 'main'], on: ['ホン'], kun: ['もと'], strokes: 5, grade: 1, jlpt: 5, level: 2, parts: ['tree', 'ground'], mn: 'A tree with a line marking its root: the origin of the thing. Paper comes from trees, so it is also a book.' },
  { c: '目', meanings: ['eye'], on: ['モク', 'ボク'], kun: ['め'], strokes: 5, grade: 1, jlpt: 4, level: 2, parts: ['eye'], mn: 'The upended eye. In compounds it often means attention, or an item on a list.' },
  { c: '田', meanings: ['rice field', 'paddy'], on: ['デン'], kun: ['た'], strokes: 5, grade: 1, jlpt: 4, level: 2, parts: ['rice field'], mn: 'The divided paddy. It sits in more surnames than any other character.' },
  { c: '手', meanings: ['hand'], on: ['シュ'], kun: ['て'], strokes: 4, grade: 1, jlpt: 5, level: 2, parts: ['hand'], mn: 'The wrist and fingers: hand.' },
  { c: '白', meanings: ['white'], on: ['ハク', 'ビャク'], kun: ['しろ', 'しろ-'], strokes: 5, grade: 1, jlpt: 5, level: 2, parts: ['white'], mn: 'The bleaching sun: white, and by extension plain or blank.' },
  { c: '天', meanings: ['heaven', 'sky'], on: ['テン'], kun: ['あま'], strokes: 4, grade: 1, jlpt: 4, level: 2, parts: ['big', 'ground'], mn: 'A big person with a line drawn over their head: the sky above everything.' },
  { c: '立', meanings: ['stand', 'stand up'], on: ['リツ', 'リュウ'], kun: ['た-'], strokes: 5, grade: 1, jlpt: 4, level: 2, parts: ['stand'], mn: 'The planted figure: to stand.' },
  { c: '生', meanings: ['life', 'live', 'raw', 'birth'], on: ['セイ', 'ショウ'], kun: ['い-', 'う-', 'なま'], strokes: 5, grade: 1, jlpt: 4, level: 2, parts: ['stand', 'ground'], mn: 'Something standing up out of the earth: life, growth, and anything still raw.' },

  { c: '気', meanings: ['spirit', 'air', 'energy', 'mood'], on: ['キ', 'ケ'], kun: [], strokes: 6, grade: 1, jlpt: 5, level: 3, parts: ['lid'], mn: 'A lid with vapour curling out from under it: steam, air, and the mood in a room \u2014 all the things you feel but cannot hold.' },
  { c: '空', meanings: ['empty', 'sky', 'air'], on: ['クウ'], kun: ['そら', 'あ-', 'から'], strokes: 8, grade: 1, jlpt: 5, level: 3, parts: ['roof', 'craft'], mn: 'A roof with nothing but craftwork holding it up, and open air beneath: empty, and the sky that is the emptiest thing of all.' },
  { c: '花', meanings: ['flower'], on: ['カ'], kun: ['はな'], strokes: 7, grade: 1, jlpt: 4, level: 3, parts: ['grass', 'person'], mn: 'Grass on top, a person bending underneath: someone stooping in the weeds to pick a flower.' },
  { c: '先', meanings: ['before', 'ahead', 'previous'], on: ['セン'], kun: ['さき'], strokes: 6, grade: 1, jlpt: 5, level: 3, parts: ['earth', 'legs'], mn: 'Legs striding out from a mound of earth: whoever is out in front, and whatever happened earlier.' },
  { c: '名', meanings: ['name'], on: ['メイ', 'ミョウ'], kun: ['な'], strokes: 6, grade: 1, jlpt: 5, level: 3, parts: ['evening', 'mouth'], mn: 'Evening, and a mouth: too dark to see a face, so you call out a name instead.' },
  { c: '学', meanings: ['study', 'learning', 'school'], on: ['ガク'], kun: ['まな-'], strokes: 8, grade: 1, jlpt: 5, level: 3, parts: ['roof', 'child'], mn: 'A child under a roof, with three marks of attention over its head: study.' },
  { c: '校', meanings: ['school'], on: ['コウ'], kun: [], strokes: 10, grade: 1, jlpt: 5, level: 3, parts: ['tree', 'lid'], mn: 'A tree beside a crossing of paths: the schoolyard, and the building set among the trees at the crossroads.' },
  { c: '円', meanings: ['circle', 'yen', 'round'], on: ['エン'], kun: ['まる-'], strokes: 4, grade: 1, jlpt: 5, level: 3, parts: ['borders', 'mouth'], mn: 'A border drawn round an opening: a circle, a round coin, and so the yen itself.' },
  { c: '雨', meanings: ['rain'], on: ['ウ'], kun: ['あめ'], strokes: 8, grade: 1, jlpt: 4, level: 3, parts: ['lid', 'borders'], mn: 'A lid of cloud, a window frame beneath it, and four drops falling inside: rain seen through the glass.' },
  { c: '石', meanings: ['stone', 'rock'], on: ['セキ', 'シャク'], kun: ['いし'], strokes: 5, grade: 1, jlpt: 4, level: 3, parts: ['mouth'], mn: 'A boulder overhanging a mouth-shaped hollow: a stone at the foot of a cliff.' },
  { c: '足', meanings: ['foot', 'leg', 'suffice'], on: ['ソク'], kun: ['あし', 'た-'], strokes: 7, grade: 1, jlpt: 4, level: 3, parts: ['mouth', 'stand'], mn: 'A mouth over a planted leg: as much as the leg needs to stand \u2014 a foot, and enough.' },
  { c: '車', meanings: ['vehicle', 'car', 'cart'], on: ['シャ'], kun: ['くるま'], strokes: 7, grade: 1, jlpt: 5, level: 3, parts: ['rice field', 'cross'], mn: 'A cart seen from above: a bed in the middle with an axle out either side.' },

  { c: '時', meanings: ['time', 'hour'], on: ['ジ'], kun: ['とき'], strokes: 10, grade: 2, jlpt: 5, level: 4, parts: ['sun', 'temple'], mn: 'The sun beside a temple: the bell that rings the hour, and time itself.' },
  { c: '分', meanings: ['minute', 'divide', 'part'], on: ['フン', 'ブン', 'ブ'], kun: ['わ-'], strokes: 4, grade: 2, jlpt: 5, level: 4, parts: ['blade'], mn: 'A blade under a split roof, cutting a thing in two: to divide, a portion, and the minute an hour is divided into.' },
  { c: '間', meanings: ['interval', 'between', 'space'], on: ['カン', 'ケン'], kun: ['あいだ', 'ま'], strokes: 12, grade: 2, jlpt: 5, level: 4, parts: ['gate', 'sun'], mn: 'Sunlight in the gap of a gate: the space between two things, and the interval between two moments.' },
  { c: '前', meanings: ['front', 'before'], on: ['ゼン'], kun: ['まえ'], strokes: 9, grade: 2, jlpt: 5, level: 4, parts: ['lid', 'moon', 'blade'], mn: 'A lid, a moon and a blade: the prow of a boat cutting ahead of you. What is in front, and what came before.' },
  { c: '後', meanings: ['behind', 'after', 'back'], on: ['ゴ', 'コウ'], kun: ['あと', 'のち', 'うし-'], strokes: 9, grade: 2, jlpt: 5, level: 4, parts: ['legs'], mn: 'A crossroads, a thread and dragging legs: whoever falls behind on the road arrives after.' },
  { c: '東', meanings: ['east'], on: ['トウ'], kun: ['ひがし'], strokes: 8, grade: 2, jlpt: 5, level: 4, parts: ['sun', 'tree'], mn: 'The sun caught in the branches of a tree: sunrise, and so the east.' },
  { c: '西', meanings: ['west'], on: ['セイ', 'サイ'], kun: ['にし'], strokes: 6, grade: 2, jlpt: 5, level: 4, parts: ['borders'], mn: 'A bird settling into a nest inside a frame: where things go at the end of the day \u2014 the west.' },
  { c: '南', meanings: ['south'], on: ['ナン'], kun: ['みなみ'], strokes: 9, grade: 2, jlpt: 5, level: 4, parts: ['cross', 'borders'], mn: 'A cross above a sheltered frame: the warm side of the house, facing south.' },
  { c: '北', meanings: ['north'], on: ['ホク'], kun: ['きた'], strokes: 5, grade: 2, jlpt: 5, level: 4, parts: ['spoon'], mn: 'Two figures back to back, turning away from each other: both have turned their backs on the north wind.' },
  { c: '京', meanings: ['capital'], on: ['キョウ', 'ケイ'], kun: [], strokes: 8, grade: 2, jlpt: 3, level: 4, parts: ['lid', 'mouth', 'legs'], mn: 'A lid over a gate over standing legs: a tall ceremonial building on a rise. The capital.' },

  { c: '語', meanings: ['language', 'word'], on: ['ゴ'], kun: ['かた-'], strokes: 14, grade: 2, jlpt: 5, level: 5, parts: ['speech', 'mouth'], mn: 'Speech, with five mouths beside it: not one utterance but a whole language of them.' },
  { c: '読', meanings: ['read'], on: ['ドク', 'トク'], kun: ['よ-'], strokes: 14, grade: 2, jlpt: 5, level: 5, parts: ['speech'], mn: 'Speech beside a merchant selling his wares: reading aloud is what turns marks on a page into a voice.' },
  { c: '書', meanings: ['write', 'writing'], on: ['ショ'], kun: ['か-'], strokes: 10, grade: 2, jlpt: 5, level: 5, parts: ['brush', 'sun'], mn: 'A brush held over a page bright as the sun: to write.' },
  { c: '話', meanings: ['speak', 'talk', 'story'], on: ['ワ'], kun: ['はな-', 'はなし'], strokes: 13, grade: 2, jlpt: 5, level: 5, parts: ['speech', 'tongue'], mn: 'Speech and a tongue: not language in the abstract but somebody actually talking.' },
  { c: '行', meanings: ['go', 'conduct', 'line'], on: ['コウ', 'ギョウ', 'アン'], kun: ['い-', 'ゆ-', 'おこな-'], strokes: 6, grade: 2, jlpt: 5, level: 5, parts: ['craft'], mn: 'A crossroads with a step taken into it: to go. In compounds it is also a line of text and a bank.' },
  { c: '来', meanings: ['come', 'next'], on: ['ライ'], kun: ['く-', 'きた-'], strokes: 7, grade: 2, jlpt: 5, level: 5, parts: ['tree', 'cross'], mn: 'A tree with two people sheltering under it, walking toward you: to come, and the week that is coming.' },
  { c: '見', meanings: ['see', 'look', 'view'], on: ['ケン'], kun: ['み-'], strokes: 7, grade: 1, jlpt: 5, level: 5, parts: ['eye', 'legs'], mn: 'An eye up on a pair of legs: sight that walks about. To see.' },
  { c: '聞', meanings: ['hear', 'listen', 'ask'], on: ['ブン', 'モン'], kun: ['き-'], strokes: 14, grade: 2, jlpt: 5, level: 5, parts: ['gate', 'ear'], mn: 'An ear inside a gate: pressed to the door, hearing what is said on the other side.' }
];

export const VOCAB = [
  { c: '一つ', meanings: ['one thing', 'one'], reading: 'ひとつ', level: 1, uses: ['一'], mn: 'The counter for a single object of no particular shape. 一 takes its ひと- reading here.' },
  { c: '二つ', meanings: ['two things', 'two'], reading: 'ふたつ', level: 1, uses: ['二'], mn: 'The same counter, two objects: ふたつ.' },
  { c: '三日', meanings: ['three days', 'the third'], reading: 'みっか', level: 1, uses: ['三', '日'], mn: 'Three and day. Both the third of the month and a span of three days.' },
  { c: '一日', meanings: ['one day', 'the first'], reading: 'いちにち', level: 1, uses: ['一', '日'], mn: 'One day. Read ついたち instead when it means the first of the month \u2014 a reading you simply learn whole.' },
  { c: '大人', meanings: ['adult', 'grown-up'], reading: 'おとな', level: 1, uses: ['大', '人'], mn: 'Big person. Neither character is read as you would expect \u2014 learn おとな whole.' },
  { c: '人口', meanings: ['population'], reading: 'じんこう', level: 1, uses: ['人', '口'], mn: 'People and mouths: how many mouths there are to count.' },
  { c: '火山', meanings: ['volcano'], reading: 'かざん', level: 1, uses: ['火', '山'], mn: 'A fire mountain.' },
  { c: '土日', meanings: ['Saturday and Sunday', 'the weekend'], reading: 'どにち', level: 1, uses: ['土', '日'], mn: 'Earth-day and sun-day, taken together: the weekend.' },
  { c: '火口', meanings: ['crater'], reading: 'かこう', level: 1, uses: ['火', '口'], mn: 'The fire mouth at the top of the mountain.' },

  { c: '日本', meanings: ['Japan'], reading: 'にほん', level: 2, uses: ['日', '本'], mn: 'Sun origin: where the sun comes from. にっぽん in anthems and on banknotes.' },
  { c: '本日', meanings: ['today'], reading: 'ほんじつ', level: 2, uses: ['本', '日'], mn: 'The main day: today, in the register of announcements and shop signs.' },
  { c: '女子', meanings: ['girl', "women's"], reading: 'じょし', level: 2, uses: ['女', '子'], mn: 'Woman and child. On a door or a fixture list it means the women\u2019s one.' },
  { c: '上下', meanings: ['up and down', 'top and bottom'], reading: 'じょうげ', level: 2, uses: ['上', '下'], mn: 'Above and below, as a pair.' },
  { c: '中立', meanings: ['neutrality', 'neutral'], reading: 'ちゅうりつ', level: 2, uses: ['中', '立'], mn: 'To stand in the middle: taking neither side.' },
  { c: '手本', meanings: ['model', 'example'], reading: 'てほん', level: 2, uses: ['手', '本'], mn: 'A hand-book in the old sense: the copybook you write against.' },
  { c: '目下', meanings: ["one's junior", 'subordinate'], reading: 'めした', level: 2, uses: ['目', '下'], mn: 'Below the eye: someone beneath you in rank. Read もっか it means instead the present moment.' },
  { c: '生水', meanings: ['unboiled water'], reading: 'なまみず', level: 2, uses: ['生', '水'], mn: 'Raw water: straight from the tap, unboiled, and the reason for the warning sign.' },

  { c: '空気', meanings: ['air', 'atmosphere'], reading: 'くうき', level: 3, uses: ['空', '気'], mn: 'Empty and spirit: the air in a room, and the mood in it too.' },
  { c: '学校', meanings: ['school'], reading: 'がっこう', level: 3, uses: ['学', '校'], mn: 'Study and schoolhouse. The small つ is written, not spoken \u2014 が-っ-こう.' },
  { c: '先生', meanings: ['teacher'], reading: 'せんせい', level: 3, uses: ['先', '生'], mn: 'Born before you: the one further along the road. A teacher, a doctor, anyone owed deference.' },
  { c: '大雨', meanings: ['heavy rain'], reading: 'おおあめ', level: 3, uses: ['大', '雨'], mn: 'Big rain.' },
  { c: '火花', meanings: ['spark'], reading: 'ひばな', level: 3, uses: ['火', '花'], mn: 'A fire flower: the bloom thrown off a struck flint.' },
  { c: '名人', meanings: ['master', 'expert'], reading: 'めいじん', level: 3, uses: ['名', '人'], mn: 'A person with a name: someone good enough that people know it.' },
  { c: '水車', meanings: ['water wheel'], reading: 'すいしゃ', level: 3, uses: ['水', '車'], mn: 'A water cart: the wheel turning in the millstream.' },

  { c: '時間', meanings: ['time', 'hour'], reading: 'じかん', level: 4, uses: ['時', '間'], mn: 'Hour and interval: time as a quantity you can spend, not a moment on a clock.' },
  { c: '分', meanings: ['minute'], reading: 'ふん', level: 4, uses: ['分'], mn: 'The counter for minutes. It becomes ぷん after some numbers \u2014 いっぷん, ろっぷん.' },
  { c: '東京', meanings: ['Tokyo'], reading: 'とうきょう', level: 4, uses: ['東', '京'], mn: 'The eastern capital \u2014 named against Kyoto, the old one to the west.' },
  { c: '西日本', meanings: ['western Japan'], reading: 'にしにほん', level: 4, uses: ['西', '日', '本'], mn: 'West Japan: the half of the country the forecast treats separately.' },
  { c: '午前', meanings: ['morning', 'a.m.'], reading: 'ごぜん', level: 4, uses: ['前'], mn: 'Before noon: the a.m. half of a timetable.' },
  { c: '午後', meanings: ['afternoon', 'p.m.'], reading: 'ごご', level: 4, uses: ['後'], mn: 'After noon: the p.m. half.' },
  { c: '南北', meanings: ['north and south'], reading: 'なんぼく', level: 4, uses: ['南', '北'], mn: 'South and north as a pair \u2014 stated in that order, the opposite of the English habit.' },

  { c: '日本語', meanings: ['Japanese language'], reading: 'にほんご', level: 5, uses: ['日', '本', '語'], mn: 'Japan language. The -ご suffix names any language: 英語, 中国語.' },
  { c: '読書', meanings: ['reading'], reading: 'どくしょ', level: 5, uses: ['読', '書'], mn: 'Reading writing: reading as a pastime, the thing you list as a hobby.' },
  { c: '見学', meanings: ['study by observation', 'a tour'], reading: 'けんがく', level: 5, uses: ['見', '学'], mn: 'Study by looking: the factory visit, the school trip.' },
  { c: '話す', meanings: ['to speak', 'to talk'], reading: 'はなす', level: 5, uses: ['話'], mn: 'The verb itself. 話し pins the reading はな- in place.' },
  { c: '行く', meanings: ['to go'], reading: 'いく', level: 5, uses: ['行'], mn: 'To go. ゆく in writing and in song; いく everywhere else.' },
  { c: '来月', meanings: ['next month'], reading: 'らいげつ', level: 5, uses: ['来', '月'], mn: 'The coming month. 来年 and 来週 work the same way.' },
  { c: '新聞', meanings: ['newspaper'], reading: 'しんぶん', level: 5, uses: ['聞'], mn: 'What is newly heard: the news, printed.' }
];

/* Seeded review history, so the app opens on a plausible record rather than an empty one.
 * [type, level, stage cycle, hours-until-due cycle (0 skips the item, negatives are overdue)] */
export const SEED = [
  ['radical', 1, [7, 7, 6, 6, 5, 5, 6, 5, 7, 6, 5, 4, 4, 5], [-2, 40, 100, 200, -6, 300, 12, -3, 900, 55, -9, 20, -1, 80]],
  ['kanji', 1, [6, 5, 5, 4, 4, 4, 3, 5, 4, 4, 3, 4, 2, 3], [-1, 20, -4, 50, -2, 8, -7, 30, -3, 60, -5, 14, 0, 0]],
  ['vocab', 1, [4, 3, 3, 2, 4, 2, 3, 1, 2], [-2, 10, -6, 24, 0, -1, 18, 0, -3]],
  ['radical', 2, [3, 2, 2, 1, 1, 0, 0, 0], [-1, -5, 6, -2, 0, 0, 12, -8]],
  ['kanji', 2, [2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [-2, -6, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]
];

export const LAPSES = {
  'kanji:上': 5, 'kanji:下': 4, 'vocab:大人': 4,
  'kanji:土': 3, 'vocab:目下': 3, 'radical:立': 3
};

export const ATTRIBUTION = 'Readings, meanings and stroke counts from KANJIDIC2 and JMdict (EDRDG, CC BY-SA), in the schema served by kanjiapi.dev. Mnemonics and level order original to Kaidoku.';

/* Live refresh. Overwrites only the factual fields; never touches level, parts or mnemonic.
 * Blocked by CORS in some sandboxed previews — the bundled data above is the fallback. */
export async function refreshFromApi(chars, onProgress) {
  const out = { updated: 0, failed: 0, changes: [] };
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    try {
      const res = await fetch('https://kanjiapi.dev/v1/kanji/' + encodeURIComponent(ch));
      if (!res.ok) throw new Error(res.status);
      const d = await res.json();
      const row = KANJI.find(k => k.c === ch);
      if (row) {
        const before = row.meanings.join(', ');
        row.meanings = d.meanings || row.meanings;
        row.on = d.on_readings || row.on;
        row.kun = d.kun_readings || row.kun;
        row.strokes = d.stroke_count || row.strokes;
        row.grade = d.grade != null ? d.grade : row.grade;
        row.jlpt = d.jlpt != null ? d.jlpt : row.jlpt;
        if (before !== row.meanings.join(', ')) out.changes.push(ch);
        out.updated++;
      }
    } catch (e) {
      out.failed++;
    }
    if (onProgress) onProgress(i + 1, chars.length);
  }
  return out;
}
