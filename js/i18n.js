/* ============================================================
   i18n.js — Монгол (default) ⇄ English
   ─────────────────────────────────────────────────────────
   "Source-text" орчуулга: DOM-ийн текст зангилаа бүрийг гүйж,
   Монгол эх бичвэр нь толь бичигт байвал англиар сольдог. Тиймээс
   HTML дотор data-i18n гэх мэт тэг нэмэх шаардлагагүй.

   • Default = Монгол (HTML дотор байгаагаараа үлдэнэ).
   • Толь бичигт зөвхөн АНГЛИ орчуулгыг хадгална (MN → EN).
   • Сонголт localStorage('scout-lang')-д хадгалагдана.
   • Орчуулахгүй элементэд  data-no-i18n  өг.
   ============================================================ */
(function () {
  const KEY = 'scout-lang';

  /* ── MN (нэг зайгаар нормчилсон) → EN ── */
  const DICT = {
    /* Nav */
    'Нүүр': 'Home',
    'Түүх': 'History',
    'Хөтөлбөр': 'Program',
    'Арга хэмжээ': 'Events',
    'Бүлгэм': 'Groups',
    'Нэгдэх': 'Join',

    /* <title> */
    'Монголын Скаутын Холбоо': 'Mongolian Scout Association',

    /* Hero */
    'МОНГОЛЫН': 'MONGOLIAN',
    'СКАУТЫН': 'SCOUT',
    'ХОЛБОО': 'ASSOCIATION',
    'Бидэнтэй Нэгдэх': 'Join Us',
    'Бидний түүх': 'Our History',
    'Гүйлгэх': 'Scroll',

    /* About strip */
    'Скаут': 'Scout',
    'Аймаг': 'Provinces',
    'Жил': 'Years',
    'Улс': 'Countries',

    /* About */
    'БИДНИЙ ӨВ': 'OUR HERITAGE',
    'Mонголд Скаутын': 'Scouting in',
    'Хөдөлгөөн': 'Mongolia',
    'Монголын Скаутын Холбоо нь хүүхэд, залуучуудыг бие даасан, хариуцлагатай, эх оронч иргэн болгон төлөвшүүлэх зорилготой сайн дурын, ашгийн бус байгууллага юм. Бид дэлхий даяар үйл ажиллагаа явуулдаг скаутын хөдөлгөөний нэг хэсэг бөгөөд залуучуудыг амьдралын ур чадварт суралцах, байгаль орчноо хайрлан хамгаалах, нийгэмдээ эерэг хувь нэмэр оруулахад чиглэсэн хөтөлбөрүүдийг хэрэгжүүлдэг.':
      'The Mongolian Scout Association is a voluntary, non-profit organisation dedicated to raising children and young people into independent, responsible and patriotic citizens. We are part of the worldwide scouting movement, running programmes that help young people learn life skills, care for the environment and make a positive contribution to society.',
    'Скаутын хөдөлгөөн нь 1991 оноос Монголд хөгжиж, өнөөдөр улс орон даяар олон мянган хүүхэд, залуучуудыг нэгтгээд байна. Манай хөтөлбөрүүд нь адал явдал, байгальд түшиглэсэн сургалт, багаар ажиллах, манлайлал, нийгмийн хариуцлагыг төлөвшүүлэх үйл ажиллагааг багтаадаг.':
      'Scouting has grown in Mongolia since 1991 and today unites many thousands of children and young people across the country. Our programmes include adventure, outdoor-based learning, teamwork, leadership and activities that build social responsibility.',
    '"Амьдралд бэлэн" — Монголын Скаутын Холбооны уриа':
      '"Be Prepared" — the motto of the Mongolian Scout Association',
    'СКАУТЫН ТҮҮХ →': 'SCOUT HISTORY →',

    /* Values */
    'Скаутын тухай': 'About Scouting',
    'Скаут гэж юу вэ?': 'What is Scouting?',
    'Скаутын хөдөлгөөн нь 1907 онд үүсч, өнөөдөр дэлхийн 170 гаруй улсад 60 сая гишүүнтэй дэлхийн хамгийн том залуучуудын байгууллага юм. Монголын Скаутын Холбоо 1991 онд байгуулагдаж, уламжлалт нүүдэлчдийн ухаан болон орчин үеийн манлайллыг хослуулан залуу монголчуудыг хүмүүжүүлж байна.':
      'Scouting began in 1907 and today is the world’s largest youth organisation, with 60 million members in over 170 countries. The Mongolian Scout Association was founded in 1991, combining traditional nomadic wisdom with modern leadership to raise young Mongolians.',

    /* Age groups */
    'Насны ангилал': 'Age Groups',
    '6 – 11 нас': 'Ages 6–11',
    '12 – 15 нас': 'Ages 12–15',
    '16 – 17 нас': 'Ages 16–17',
    '18 – 25 нас': 'Ages 18–25',
    'Каб': 'Cub',
    'Венчир': 'Venture',
    'Ровер': 'Rover',
    'Тоглоомын аргаар суралцана. Бие бялдраа хөгжүүлнэ. Сахилга батад суралцана. Бусдад тусалж үүрэг хариуцлагаа нэмэгдүүлнэ.':
      'Learn through play. Develop physically. Build discipline. Help others and grow a sense of responsibility.',
    'Үйл ажиллагааны явцад суралцана. Хариуцлага хүлээж эхэлнэ. Хээрийн үйл ажиллагаанд оролцож эхэлнэ.':
      'Learn by doing. Begin to take on responsibility. Start joining outdoor activities.',
    'Даван туулах зарчмаар суралцана. Скаутын туслах удирдагч болно. Шинийг санаачлана.':
      'Learn by overcoming challenges. Become an assistant scout leader. Take initiative.',
    'Каб, скаутуудад тусална. Олон нийт болон нийгмийн сайн сайхны төлөө үйл ажиллагаа санаачлан зохион байгуулна.':
      'Support cubs and scouts. Initiate and organise activities for the community and the public good.',

    /* Activities */
    'Гол үйл ажиллагаа': 'Key Activities',
    'Хээрийн кемп': 'Field Camp',
    'Аялал экспедиц': 'Expeditions',
    'Олон нийтийн үйлчилгээ': 'Community Service',
    'Ур чадварын тэмдэг': 'Merit Badges',
    'Монгол уламжлал': 'Mongolian Heritage',
    'Олон улсын арга хэмжээ': 'International Events',
    'Монголын тал нутагт тэнгэрийн дор хонож, байгаль дэлхийтэй нэгдэх.':
      'Sleep under the open sky on the Mongolian steppe and connect with nature.',
    'Хангайн нуруунаас Говийн элст цөл хүртэл — Монголын өнцөг булан бүрийг судлах дайчин аялалууд.':
      'From the Khangai mountains to the Gobi desert — bold expeditions exploring every corner of Mongolia.',
    'Орон нутгийн иргэдэд туслах, байгаль орчноо хамгаалах, нийгмийн асуудлыг шийдвэрлэхэд оролцох.':
      'Help local communities, protect the environment and take part in solving social issues.',
    'Анагаах ухаан, гэрэл зураг, хөгжим, кодчилол зэрэг 100 гаруй чиглэлээр мэдлэг эзэмшиж тэмдэг хүртэх.':
      'Earn badges by gaining skills in over 100 fields such as first aid, photography, music and coding.',
    'Наадам, морь унах, сур харваа, гэр барих — монгол нүүдэлчдийн мэргэжлийг өвлүүлэн залгамжлах.':
      'Naadam, horse riding, archery and building a ger — passing on the craft of Mongolian nomads.',
    'Дэлхийн Жамбори болон бусад олон улсын арга хэмжээнд оролцож 170 улсын скаутуудтай уулзах.':
      'Take part in the World Jamboree and other international events, meeting scouts from 170 countries.',

    /* Promise + facts */
    'Скаутын андгай': 'The Scout Promise',
    '"Итгэл үнэмшил болон эх орондоо үнэнч байж ямар ч үед бусдад туслан, Скаутын хуулинд захирагдахад өөрөө хамаарах бүхнийг хийхээ нэр төрөөрөө андгайлж байна."':
      '"On my honour I promise to do my best, to be faithful to my beliefs and my homeland, to help others at all times, and to live by the Scout Law."',
    'Тоо баримт': 'Facts',
    'Гишүүн улс': 'Member countries',
    'Дэлхийн скаут': 'Scouts worldwide',
    'Үүсгэн байгуулагдсан': 'Founded',
    'Монгол скаут': 'Mongolian scouts',
    'Аймаг хамрагдсан': 'Provinces covered',
    'МСХ байгуулагдсан': 'MSA established',

    /* Programs */
    'Хөтөлбөрүүд': 'Programs',
    'Скаутын Хөтөлбөрүүд': 'Scout Programs',
    'Ур чадварын тэмдэгт': 'Merit Badges',
    'Хөтөлбөрийн уялдаа': 'Curriculum Alignment',
    'Удирдагчдад зориулсан сургалт': 'Leader Training',
    'Каб скаут, Скаут, Ровер, Удирдагч нас бүрт тохирсон хөтөлбөртэй.':
      'Cub Scout, Scout, Rover and Leader — a programme suited to every age.',
    'Хүрэл, Мөнгөн, Алтан сум зэрэглэлээр дамжин Алтан Шонхор хүртэлх хувийн хөгжлийн зам.':
      'A personal development path from the Bronze, Silver and Gold Arrow tiers up to the Golden Falcon.',
    'ЕБС-ийн I–XII ангийн сургалтын хөтөлбөртэй уялдсан, сургуулийн хичээлийг гүнзгийрүүлэх боломж.':
      'Aligned with the grade I–XII school curriculum, deepening what pupils learn in class.',
    'GIT - Basic Leader Training - Wood Badge гэсэн тасралтгүй хөгжлийн шаталсан сургалтын систем.':
      'A continuous, tiered training system: GIT – Basic Leader Training – Wood Badge.',
    'Дэлгэрэнгүй →': 'Learn more →',

    /* Gallery */
    'Хээрийн амьдрал': 'Outdoor Life',
    'Гэрэл зургийн цомог': 'Photo Gallery',

    /* Join */
    'Скаутад элсэх': 'Join Scouting',
    'Бидэнтэй': 'Want to',
    'Нэгдэх үү?': 'Join Us?',
    'Нэвтрэх хэсгийг бүтэн бөглөнө үү': 'Fill out the registration form',
    'Боломжит бүлгэмд холбож өгнө': 'We connect you with a nearby group',
    'Сургалтад хамрагдана': 'Attend training',
    'Андгай өргөнө': 'Take the Scout promise',
    'Шинэ элсэлтийн бүртгэл': 'New Member Registration',
    'Доорх мэдээллийг бөглөж илгээгээрэй. Хүлээн авмагц бид хамгийн ойрын бүлгэмтэй холбож өгөх болно.':
      'Fill in the details below and send. As soon as we receive it, we’ll connect you with the nearest group.',
    'Овог *': 'Last name *',
    'Нэр *': 'First name *',
    'Имэйл *': 'Email *',
    'Утас': 'Phone',
    'Нас': 'Age',
    'Сонгох': 'Select',
    'Насанд хүрэгч': 'Adult',
    'Байршил': 'Location',
    'Зурвас': 'Message',
    'Илгээх →': 'Submit →',
    '✓ Таны хүсэлт амжилттай илгээгдлээ. Бид удахгүй холбогдох болно.':
      '✓ Your request has been sent successfully. We’ll be in touch soon.',
    'Илгээх үед алдаа гарлаа. Дахин оролдоно уу.':
      'Something went wrong while sending. Please try again.',

    /* Form placeholders */
    'Улаанбаатар, Дархан...': 'Ulaanbaatar, Darkhan...',
    'Сонирхож буй хөтөлбөр, нэмэлт мэдээлэл...': 'Program of interest, extra info...',

    /* Footer */
    'Адал явдал, тал нутгийн мөнхийн өв соёлыг эрхэмлэн Монголын залуусыг нэгтгэж, төлөвшүүлэхийг зорьдог. Бид 1991 оноос хойш Дэлхийн Скаутын Хөдөлгөөний Байгууллагын гишүүнээр ажиллаж байна.':
      'Cherishing adventure and the timeless heritage of the steppe, we unite and develop Mongolia’s youth. Since 1991 we have been a member of the World Organization of the Scout Movement.',
    'Цэс': 'Menu',
    'Бидний тухай': 'About us',
    'Каб Скаут (6–11)': 'Cub Scout (6–11)',
    'Скаут (12–15)': 'Scout (12–15)',
    'Венчир Скаут (16–17)': 'Venture Scout (16–17)',
    'Ровер Скаут (18–25)': 'Rover Scout (18–25)',
    'Удирдагч': 'Leader',
    'Холбоо барих': 'Contact',
    'Монголын Скаутын Холбоо. Бүх эрх хуулиар хамгаалагдсан.':
      'Mongolian Scout Association. All rights reserved.',
    'Улаанбаатар, Монгол': 'Ulaanbaatar, Mongolia',
    'Бэлэн бай': 'Be Prepared',

    /* ═════════ HISTORY ═════════ */
    'Скаут гэж': 'What is',
    'юу вэ?': 'a Scout?',
    'Зорилго': 'Mission',
    'Эрхэм зорилго': 'Our Mission',
    'Скаутын хөдөлгөөний эрхэм зорилго нь скаутын андгай хуульд тулгуурлан залуу үеийнхний боловсролд хувь нэмэр оруулж, ирээдүйн амьдарлаа цогцлон байгуулах, нийгэмд бүтээлч байр суурь эзлэх, бие даасан хувь хүмүүсийг төлөвшүүлэхэд оршино.':
      'Grounded in the Scout promise and law, the mission of the scouting movement is to contribute to the education of young people, help them build their future lives, take a constructive place in society and develop into independent individuals.',
    'Монголын Скаутын Холбоо нь нь хүүхэд, залуучуудыг бие даасан, хариуцлагатай, эх оронч иргэн болгон төлөвшүүлэх зорилготой сайн дурын, ашгийн бус гишүүддээ үйлчилдэг төрийн бус байгууллага юм. Манай байгууллага нь дэлхий даяар үйл ажиллагаа явуулдаг скаутын хөдөлгөөний нэг хэсэг бөгөөд залуучуудыг амьдралын ур чадварт суралцах, байгаль орчноо хайрлан хамгаалах, нийгэмдээ эерэг хувь нэмэр оруулахад чиглэсэн хөтөлбөрүүдийг хэрэгжүүлдэг.':
      'The Mongolian Scout Association is a voluntary, non-profit, member-serving non-governmental organisation dedicated to raising children and young people into independent, responsible and patriotic citizens. We are part of the worldwide scouting movement and run programmes that help young people learn life skills, care for the environment and contribute positively to society.',
    'Скаутын хөдөлгөөн нь анх Robert Baden-Powell-ийн санаачилгаар үүсч, өнөөдөр дэлхийн 170 гаруй улсад 60 сая гаруй хүүхэд, залуучуудыг нэгтгэсэн олон улсын хөдөлгөөн болон хөгжсөн. Монгол Улсад скаутын хөдөлгөөн 1991 оноос хөгжиж, өнөөдөр улс орон даяар олон мянган хүүхэд, залуучуудыг эгнээнд нэгтгээд байна.':
      'Scouting began on the initiative of Robert Baden-Powell and today has grown into an international movement uniting over 60 million children and young people in more than 170 countries. In Mongolia, scouting has developed since 1991 and now brings together many thousands of children and young people across the country.',
    'Манай хөтөлбөрүүд нь хүүхэд, залуучуудыг насны ангиллаар нь хөгжүүлэхэд чиглэдэг бөгөөд адал явдал, байгальд түшиглэсэн сургалт, багаар ажиллах, манлайлал, нийгмийн хариуцлагыг төлөвшүүлэх үйл ажиллагааг багтаадаг. Скаутын арга барил нь "хийх явцдаа сурах" зарчимд тулгуурладаг бөгөөд оролцогчид өөрсдийн туршлагаар дамжуулан мэдлэг, ур чадвар эзэмшдэг.':
      'Our programmes are designed to develop children and young people by age group and include adventure, outdoor-based learning, teamwork, leadership and activities that build social responsibility. The scouting method is based on the principle of "learning by doing", and participants gain knowledge and skills through their own experience.',
    'Монголын Скаутын Холбоо нь хүүхэд, залуучуудыг "Амьдралд бэлэн" иргэн болгон төлөвшүүлэх зорилгын дор скаутын тангараг, хууль, үнэт зүйлсийг эрхэмлэн ажилладаг. Бид хамтын ажиллагаа, нөхөрлөл, хүндлэл, хариуцлагыг эрхэмлэж, ирээдүйн манлайлагчдыг бэлтгэхэд хувь нэмрээ оруулж байна.':
      'Under the goal of shaping children and young people into citizens who are "Prepared for Life", the Mongolian Scout Association upholds the Scout oath, law and values. We cherish collaboration, friendship, respect and responsibility, and contribute to preparing the leaders of the future.',
    'Скаутын Түүх': 'Scout History',
    'Скаутын хөдөлгөөн нь 1907 онд үүсгэн байгуулагдсан, хүүхэд залуучуудыг хариуцлагатай, ёс суртахуунтай, манлайлагч иргэн болгон төлөвшүүлэх зорилготой дэлхийн хэмжээний боловсролын хөдөлгөөн юм. Өнөөдөр энэхүү хөдөлгөөн нь дэлхийн 170 гаруй улсад 60 сая гаруй гишүүдийг нэгтгэсэн, залуучуудын хөгжил, манлайллыг дэмжигч хамгийн том сайн дурын хөдөлгөөнүүдийн нэг болоод байна.':
      'Founded in 1907, scouting is a worldwide educational movement aimed at shaping children and young people into responsible, ethical and leading citizens. Today it unites over 60 million members in more than 170 countries and is one of the largest voluntary movements supporting youth development and leadership.',
    'Монголын Скаутын Холбоо нь 1991 онд байгуулагдсан бөгөөд Монголын уламжлалт нүүдэлчдийн соёл, ухаан, үнэт зүйлсийг орчин үеийн боловсрол, манлайллын арга барилтай хослуулан хүүхэд, залуучуудыг амьдралд бэлтгэх, эх оронч, хариуцлагатай иргэн болгон төлөвшүүлэхийн төлөө ажиллаж байна.':
      'Founded in 1991, the Mongolian Scout Association combines the traditional nomadic culture, wisdom and values of Mongolia with modern education and leadership methods, working to prepare children and young people for life and to shape them into patriotic, responsible citizens.',
    'Дэлхийд үүссэн он': 'Founded worldwide',
    'Монголд үүссэн он': 'Founded in Mongolia',
    'Он цагийн хэлхээ': 'Timeline',
    'Скаутын түүхэн замнал': 'The journey of scouting',
    'Скаутын хөдөлгөөн үүсэв': 'Scouting is born',
    'Robert Baden-Powell Их Британид анхны скаутын лагерь зохион байгуулж, скаутын хөдөлгөөнийг үндэслэв.':
      'Robert Baden-Powell organised the first scout camp in Great Britain, founding the scouting movement.',
    'Дэлхийн анхны Жамбори': 'The first World Jamboree',
    'Лондонд анхны дэлхийн скаутын Жамбори болж, 34 улсаас 8,000 скаут оролцов.':
      'The first World Scout Jamboree was held in London, with 8,000 scouts from 34 countries.',
    'Монголд скаутын хөдөлгөөн үүслээ': 'Scouting begins in Mongolia',
    '1991 оны 3 сарын 17-нд Монгол Улсад скаутын хөдөлгөөн албан ёсоор үүсч, залуучуудыг нэгтгэж эхлэв.':
      'On 17 March 1991 the scouting movement was officially established in Mongolia and began uniting young people.',
    'МСХ ТББ байгуулагдлаа': 'MSA founded as an NGO',
    '1992 оны 4 сарын 16-нд Монголын Скаутын Холбоо Төрийн бус байгууллага (ТББ) болгон албан ёсоор байгуулагдлаа.':
      'On 16 April 1992 the Mongolian Scout Association was officially established as a non-governmental organisation (NGO).',
    'WOSM-д гишүүнээр элсэв': 'Joined WOSM',
    'Монголын Скаутын Холбоо Дэлхийн Скаутын Хөдөлгөөний Байгууллагын (WOSM) 136 дахь албан ёсны гишүүн орон болж элсэв.':
      'The Mongolian Scout Association became the 136th official member country of the World Organization of the Scout Movement (WOSM).',
    'WOSM-д гишүүнээр элсэв / Анхны Үндэсний Жембори': 'Joined WOSM / First National Jamboree',
    'Монголын Скаутын Холбоо Дэлхийн Скаутын Хөдөлгөөний Байгууллага (WOSM)-д албан ёсоор гишүүнээр элсэв. Анхны Үндэсний Жембори зохион байгуулагдсан.':
      'The Mongolian Scout Association officially joined the World Organization of the Scout Movement (WOSM). The first National Jamboree was held.',
    'Улс даяар өргөжив': 'Expanded nationwide',
    'Нийслэлийн 9 дүүрэг болон 21 аймагт скаутын бүлгүүд байгуулагдаж, хамрах хүрээ нэмэгдэв.':
      'Scout groups were established across the capital’s 9 districts and 21 provinces, widening our reach.',
    '15,000+ гишүүн': '15,000+ members',
    'Монголын Скаутын Холбоо нь 15,000 гаруй гишүүнтэй, улс орны хамгийн идэвхтэй залуучуудын байгууллагуудын нэг болоод байна.':
      'The Mongolian Scout Association now has over 15,000 members and is one of the country’s most active youth organisations.',
    'Гурван зарчим': 'Three Principles',
    'Скаутын зарчмууд': 'Scout Principles',
    'Бурхны өмнө хүлээх үүрэг': 'Duty to God',
    'Амьдралын оюун санааны үнэт зүйлд хандах хандлага — итгэл, ёс суртахуун, байгаль орчинд хүндэтгэлтэй хандахыг агуулдаг.':
      'An attitude towards life’s spiritual values — encompassing faith, morality and respect for the environment.',
    'Бусдын өмнө хүлээх үүрэг': 'Duty to others',
    'Бие хүн нийгэмд хандах хандлага — хамтын оролцоо, нийгмийн хариуцлага, буусдад тусламж үзүүлэх.':
      'The individual’s attitude towards society — shared participation, social responsibility and helping others.',
    'Өөрийн өмнө хүлээх үүрэг': 'Duty to self',
    'Хувь хүн өөрийнхөө өмнө хүлээх хариуцлага — өөрийгөө хөгжүүлэх, эрүүл мэндийг хамгаалах.':
      'The individual’s responsibility to themselves — self-development and protecting one’s health.',
    'Ёс зүй': 'Ethics',
    'Скаутын хууль': 'The Scout Law',
    'Скаутын нэр төрийг хамгаална.': 'A scout protects the honour of scouting.',
    'Скаут нь үнэнч шударга байна.': 'A scout is honest and trustworthy.',
    'Скаут нь зэлдэг найрсаг байна.': 'A scout is warm and friendly.',
    'Скаут нь арвич хямгач байна.': 'A scout is thrifty.',
    'Скаут нь ахмадаа хүндэлж, тэдний сургамжийг байнга биелүүлнэ.':
      'A scout respects their elders and always follows their guidance.',
    'Скаут нь бүх хүний найз нөхөр байж, тэдэнд байнга туслана.':
      'A scout is a friend to all people and always helps them.',
    'Скаут нь байгаль, ан амьтны нөхөр байна.': 'A scout is a friend to nature and animals.',
    'Скаут нь үг хэл, бодол санаа, ажил үйлсээрээ цэвэр ариун байна.':
      'A scout is clean in word, thought and deed.',
    'Скаут нь ямарч үед сэтгэл өөдрөг байж, тохиолдсон бэрхшээлийг даван туулах чадвартай байна.':
      'A scout stays optimistic at all times and is able to overcome any difficulty.',
    'Скаутын гэр бүлд нэгдэх үү?': 'Want to join the Scout family?',
    'Нийслэлийн 9 дүүрэг, 21 аймагт байгаа скаутын бүлэгт элсэх боломжтой.':
      'You can join scout groups across the capital’s 9 districts and 21 provinces.',
    'Элсэх хүсэлт илгээх →': 'Send a join request →',

    /* ═════════ EVENTS ═════════ */
    'Арга': 'Our',
    'хэмжээ': 'Events',
    'Удахгүй': 'Upcoming',
    'Өнгөрсөн': 'Past',
    'Бүх арга хэмжээ': 'All events',
    'Кемп': 'Camp',
    'Олон улс': 'International',
    'Сургалт': 'Training',
    'Цааш үзэх': 'Load more',
    'Мэдэгдэл': 'Announcements',
    'Бүгдийг үзлээ': 'All shown',
    'Бүртгүүлэх →': 'Register →',
    'Арга хэмжээ олдсонгүй': 'No events found',
    'Өнгөрсөн арга хэмжээ байхгүй байна.': 'There are no past events.',
    'Удахгүй болох арга хэмжээ байхгүй байна.': 'There are no upcoming events.',
    'Арга хэмжээний мэдээлэл ачаалагдсангүй': 'Events could not be loaded',
    'Холболтод алдаа гарлаа. Хуудсыг дахин ачаалж үзнэ үү эсвэл хэсэг хүлээгээд дахин оролдоно уу.':
      'A connection error occurred. Please reload the page, or wait a moment and try again.',
    'Мэдээлэл ачаалагдсангүй.': 'Could not load.',
    'Мэдэгдэл ачаалагдсангүй.': 'Announcements could not be loaded.',
    'Мэдэгдэл байхгүй байна.': 'No announcements.',
    'Огноо': 'Date',
    'Төлбөр': 'Fee',
    'Төлбөрт багтах зүйлс': 'What the fee includes',
    'Бүртгэл хаагдах:': 'Registration closes:',

    /* ═════════ BULGEM (map) ═════════ */
    'Монгол даяар': 'The scout movement',
    'скаутын хөдөлгөөн': 'across Mongolia',
    'Бүлгэмийн тоо:': 'Number of groups:',
    'Бүлгэмгүй': 'No groups',
    '1–2 бүлгэм': '1–2 groups',
    '3–5 бүлгэм': '3–5 groups',
    '6+ бүлгэм': '6+ groups',
    'Аймаг сонгоно уу': 'Select a province',
    'Газрын зураг дээр дарж тухайн аймгийн скаутын бүлгэмийн мэдээллийг үзнэ үү.':
      'Click on the map to see the scout groups in that province.',
    'Газрын зургийн эх сурвалж: Wikimedia Commons (CC BY-SA 4.0).':
      'Map source: Wikimedia Commons (CC BY-SA 4.0).',
    'Нийслэл': 'Capital',
    'бүлгэм': 'groups',
    'скаут': 'scouts',
    'Энэ аймагт идэвхтэй скаутын бүлгэм одоохондоо алга байна.':
      'There are no active scout groups in this province yet.',
    'Улаанбаатарт идэвхтэй скаутын бүлгэм одоохондоо алга байна.':
      'There are no active scout groups in Ulaanbaatar yet.',
    'Бүлгэм байгуулах сонирхолтой бол бидэнтэй холбогдоно уу.':
      'If you’re interested in starting a group, please get in touch.',
    'Бүлгэмд нэгдэх →': 'Join a group →',

    /* ═════════ PROGRAM ═════════ */
    'Скаутын': 'Scout',
    'Танилцуулга': 'Overview',
    'Тэмдэгт': 'Badges',
    'Хөгжлийн замнал': 'Development path',
    'Монголын Скаутын Холбоо нь Нийслэлийн 9 дүүрэг, 21 аймагт үйл ажиллагаа явуулдаг бөгөөд хүүхэд бүрийн нас, хөгжилд тохирсон хөтөлбөртэй.':
      'The Mongolian Scout Association operates across the capital’s 9 districts and 21 provinces, with a programme suited to every child’s age and development.',
    '6–11 нас': 'Ages 6–11',
    '12–15 нас': 'Ages 12–15',
    '16–17 нас': 'Ages 16–17',
    '18–25 нас': 'Ages 18–25',
    'Насанд хүрэгчид': 'Adults',
    'Каб Скаут': 'Cub Scout',
    'Ровер Скаут': 'Rover Scout',
    'Скаутын удирдагч': 'Scout Leader',
    'Каб нас нь 6–11 насны хүүхдүүдэд зориулсан скаутын хөдөлгөөний анхан шатны хөгжлийн үе. Хүүхдийг тоглоом, сонирхолтой үйл ажиллагаагаар дамжуулан суралцах, хамт олны дунд зөв төлөвшихэд чиглэдэг.':
      'The Cub stage is the first developmental phase of scouting, for children aged 6–11. It focuses on learning through play and engaging activities, and on growing well within a group.',
    'Кабууд нь бүлгээрээ буюу "кабын бүлэг"-ээр дамжин ажилладаг. Хамтын ажиллагаа, нөхөрлөл, буусдыг хүндлэх, энгийн хариуцлагийг эзэмшдэг.':
      'Cubs work together in their "cub pack". They build teamwork, friendship, respect for others and a basic sense of responsibility.',
    '12–17 насны хүүхэд, өсвөр үеийнхний бие бялдар, оюун ухаан, нийгмийн хөгжлийг дэмжих зорилготой хөгжлийн шат юм.':
      'A development stage that supports the physical, intellectual and social growth of children and teenagers aged 12–17.',
    'Монгол орны уур амьсгал, улирлын онцлогт тохируулан танхимын болон байгальд түшиглэсэн хэлбэрээр зохион байгуулдаг.':
      'It is run both indoors and outdoors, adapted to Mongolia’s climate and seasons.',
    'Өсвөр насны скаутуудыг ирээдүйн удирдагч болгоход чиглэх үе шат.':
      'A stage that prepares teenage scouts to become future leaders.',
    'Бүлгийн ажил зохион байгуулж, нийгмийн амьдралд скаутаар дамжуулан оролцож эхэлдэг.':
      'They begin to organise group work and to take part in social life through scouting.',
    'Ровер скаутын салбар нь 18–25 насны залуучуудыг хамарсан, скаутын хөдөлгөөний хамгийн идэвхтэй, нийгэмд чиглэсэн салбар юм.':
      'The Rover branch covers young people aged 18–25 and is the most active, society-focused branch of the scouting movement.',
    'Роверууд нь сайн дурын ажил, манлайлал, олон улсын харилцаагаар дамжуулан туршлага хуримтлуулж, амьдралын бодит ур чадварыг эзэмшдэг.':
      'Rovers gain experience through volunteering, leadership and international relations, building real-world life skills.',
    'Скаутын удирдагч нь хүүхэд, залуучуудын хөгжилд туслах, хөтөлбөрийн хэрэгжилтийг хангах насанд хүрсэн гишүүд юм. BTC болон Wood Badge сургалтаар мэргэжлийн ур чадвараа дээшлүүлдэг.':
      'Scout leaders are adult members who support the development of children and young people and ensure programmes are delivered. They sharpen their professional skills through BTC and Wood Badge training.',
    'Чоно каб': 'Wolf cub',
    'Буга каб': 'Deer cub',
    'Баавгай каб': 'Bear cub',
    'Жилд 368 цаг': '368 hours/year',
    'Байгальд сургалт': 'Outdoor training',
    'Зуны зуслан': 'Summer camp',
    'Алтан шонхор': 'Golden Falcon',
    'Сайн дурын ажил': 'Volunteering',
    'БУБАШҮС': 'BUBASHUS',
    'Модон Тэмдэгт': 'Wood Badge',
    'Кабын удирдагч': 'Cub leader',
    'Скаут нас — 12–15': 'Scout age — 12–15',
    'Сургалтын хэлбэр': 'Forms of training',
    'Танхимын сургалт': 'Indoor training',
    '10 дугаар сарын 1-нээс 5 дугаар сарын 1-ний өдөр хүртэл': 'From 1 October to 1 May',
    '7 хоногт 1 удаа, 32 долоо хоног': 'Once a week, 32 weeks',
    'Нэг удаагийн сургалт 90 хүртэлх минут': 'Up to 90 minutes per session',
    'Бүлгийн ажил болон онлайн мэдлэг, ур чадварын сургалтууд':
      'Group work and online knowledge and skills sessions',
    'Байгальд түшиглэсэн сургалт': 'Outdoor-based training',
    '5 дугаар сараас 9 дүгээр сар хүртэл': 'From May to September',
    'Байгальд түшиглэсэн зуны арга хэмжээ': 'Outdoor-based summer activities',
    'Майхант зуслан, цугларалтууд зохион байгуулагдана': 'Tented camps and gatherings are organised',
    'Хээрийн явган аялал — 80 цаг (сард 1 удаа)': 'Field hikes — 80 hours (once a month)',
    'Зуны зуслан, цугларалт — 240 цаг (2 удаа)': 'Summer camps and gatherings — 240 hours (twice)',
    'Хувийн хөгжил': 'Personal development',
    'Мэдлэг, Чадвар, Дадлын тэмдэг': 'Knowledge, Skill and Practice Badges',
    'Скаутын эгнээнд нэгдсэн хүн бүр өөрийн нас, хөгжлийн онцлогт тохирсон сургалтын хөтөлбөр, сорилт, болзлыг үе шаттайгаар биелүүлснээр мэдлэг, ур чадвар, дадлаа хөгжүүлж, ахиц дэвшлээ илэрхийлэх тэмдэг, зэрэглэл хүртдэг.':
      'Everyone who joins the scouting ranks earns badges and ranks that mark their progress by completing — stage by stage — the training programmes, challenges and requirements suited to their age and development, building their knowledge, skills and habits.',
    'Тэмдгийн тогтолцооны үндсэн зорилго, эрхэм үнэ цэнэ нь түүнийг зөв, зохистой хэрэгжүүлсэн тохиолдолд скаут бүрийн хөгжлийн явцад тулгарч болох бэрхшээл, хоцрогдлыг арилгаж, тэднийг идэвх санаачилгатай, өөртөө итгэлтэйгээр урагшлахад дэмжлэг үзүүлэхэд оршино. Энэхүү тогтолцоо нь скаутуудад мэдлэг, боловсрол, ур чадвараа тасралтгүй хөгжүүлэх боломжийг олгож, амжилтад хүрэхийн төлөө өөрийгөө хөгжүүлэх урам зоригийг төрүүлдэг.':
      'When applied properly, the badge system’s core purpose and value is to remove the difficulties and gaps a scout may face during their development, and to support them in moving forward with initiative and self-confidence. The system lets scouts continuously develop their knowledge, education and skills, and inspires the drive to grow towards success.',
    'Каб нас (6–11)': 'Cub age (6–11)',
    'Кабын зэрэглэлийн тэмдэг': 'Cub rank badges',
    '🐺 Чоно каб': '🐺 Wolf cub',
    '🦌 Буга каб': '🦌 Deer cub',
    '🐻 Баавгай каб': '🐻 Bear cub',
    '1-2-р ангийн сурагч · 12 шалгуур': 'Grades 1–2 · 12 criteria',
    '3-4-р ангийн сурагч · 24 шалгуур': 'Grades 3–4 · 24 criteria',
    '5-р ангийн сурагч · 5 шалгуур': 'Grade 5 · 5 criteria',
    'ЕБС-ийн 1-2-р ангийн сурагчдын батлагдсан хөтөлбөрийн дагуу Биеийн тамир, Дүрслэх урлаг, технологи, Хүн ба орчин, Иргэний ёс зүйн боловсрол хичээлийн агуулгатай уялдаж байна.':
      'Aligned with the approved grade 1–2 school curriculum in Physical Education, Fine Arts & Technology, Man & Environment, and Civic Ethics.',
    'ЕБС-ийн 3-4-р ангийн сурагчдын батлагдсан хөтөлбөрийн дагуу Биеийн тамир, Монгол хэл, Хүн ба орчин, Дүрслэх урлаг, технологи, Хүн ба нийгэм хичээлийн агуулгатай уялдаж байна.':
      'Aligned with the approved grade 3–4 school curriculum in Physical Education, Mongolian Language, Man & Environment, Fine Arts & Technology, and Man & Society.',
    'ЕБС-ийн 5-р ангийн сурагчдын батлагдсан хөтөлбөрийн дагуу Хүн ба нийгэм хичээлийн агуулгатай уялдаж байна.':
      'Aligned with the approved grade 5 school curriculum in Man & Society.',
    'Бие, бялдар, ур чадвар': 'Body, fitness, skills',
    'Гэр ахуйн дархан': 'Household handicraft',
    'Төрийн далбаа': 'The state flag',
    'Монгол ардын мэндлэх ёс': 'Mongolian greeting customs',
    'Манай гэр бүл': 'Our family',
    'Аюулгүй байдал': 'Safety',
    'Цуглуулга': 'Collecting',
    'Эрүүл мэнд': 'Health',
    'Ардын аман зохиол': 'Folk literature',
    'Өнгөрсөн үеийн түүхийн мөчүүд': 'Moments from history',
    'Байгаль дэлхий': 'The natural world',
    'Мэдээлэл': 'Information',
    'Загвар зохиох': 'Design',
    'Хоол хийх': 'Cooking',
    'Спорт': 'Sport',
    'Аялал': 'Travel',
    'Миний амьдардаг газар': 'Where I live',
    'Гэр бүлээ онцгой болгох': 'Making family special',
    'Өөрийгөө эрүүл ба аюулгүй байлгах': 'Keeping yourself healthy and safe',
    'Үүнийг би яаж хэлэх вэ?': 'How do I say this?',
    'Эрүүл агаарт гарцгааяа': 'Let’s get outdoors',
    'Скаут нас (6–11-р анги)': 'Scout age (grades 6–11)',
    'Скаутын зэрэглэлийн тэмдэг': 'Scout rank badges',
    '65 төрлийн мэдлэг, дадал, чадварын тэмдэгтийг 6–11-р ангийн сурагчид өөрийн хичээлийн агуулгатай уялдуулан бүрэн хамгаалах боломжтой. 65 төрлийн тэмдэгт нь ЕБ сургуулийн сурагчдын батлагдсан хөтөлбөрийн':
      'Pupils in grades 6–11 can fully earn 65 types of knowledge, practice and skill badges in line with their school subjects. The 65 badges are aligned with the',
    '20 төрлийн хичээлийн агуулгатай': '20 subject areas',
    'уялдаж байна.': 'of the approved national curriculum.',
    'Хүрэл сум': 'Bronze Arrow',
    'Мөнгөн сум': 'Silver Arrow',
    'Алтан сум': 'Gold Arrow',
    '6-7-р ангийн сурагч': 'Grades 6–7',
    '8-9-р ангийн сурагч': 'Grades 8–9',
    '10-12-р ангийн сурагч': 'Grades 10–12',
    'Хүрэл сум нь үндсэн 5 мэдлэг, дадал, чадварын тэмдэгийг хамгаалсан байх ёстой бөгөөд энэ нь 1 хичээлийн агуулгатай уялдаж байна.':
      'The Bronze Arrow requires earning 5 core knowledge, practice and skill badges, aligned with 1 school subject.',
    'Мөнгөн сум нь үндсэн 6 мэдлэг, дадал, чадварын тэмдэгийг хамгаалсан байх ёстой бөгөөд энэ нь 4 хичээлийн агуулгатай уялдаж байна.':
      'The Silver Arrow requires earning 6 core knowledge, practice and skill badges, aligned with 4 school subjects.',
    'Алтан сум нь үндсэн 5 мэдлэг, дадал, чадварын тэмдэгийг хамгаалсан байх ёстой бөгөөд энэ нь 3 хичээлийн агуулгатай уялдаж байна.':
      'The Gold Arrow requires earning 5 core knowledge, practice and skill badges, aligned with 3 school subjects.',
    'Монгол нутаг': 'Mongolian land',
    'Анхны тусламж': 'First aid',
    'Байгаль орчин': 'Environment',
    'Манлайлал': 'Leadership',
    'Олон нийт': 'Community',
    'Дэлхий иргэн': 'Global citizen',
    'Ахлах манлайлал': 'Senior leadership',
    'Нийгмийн үйлчилгээ': 'Community service',
    'Хамгийн дээд зэрэглэл': 'The highest rank',
    'Алтан Шонхор': 'Golden Falcon',
    'Алтан Шонхор нь Монголын Скаутын Холбооны хамгийн дээд зэрэглэлийн тэмдэг бөгөөд скаутын бүхий л шатны хөтөлбөрийг амжилттай дуусгасан гишүүнд олгодог.':
      'The Golden Falcon is the highest-ranking badge of the Mongolian Scout Association, awarded to members who have successfully completed every stage of the scouting programme.',
    'ЕБС-тэй хамтын ажиллагаа': 'Partnership with schools',
    'Монголын Скаутын Холбооны кабын хөтөлбөр нь ЕБС-ийн I–V ангийн сургалтын хөтөлбөртэй, скаутын хөтөлбөр нь VI–XII ангийн хөтөлбөртэй уялдсан байдаг. Скаутын хөтөлбөр нь хичээлийн хөтөлбөрт ороогүй 45 төрлийн мэдлэг, дадал, чадварыг олгох боломжтой.':
      'The Association’s cub programme is aligned with the grade I–V school curriculum, and the scout programme with grades VI–XII. The scout programme can also teach 45 types of knowledge, practice and skills not covered by the school curriculum.',
    'Скаутын хөтөлбөр нь хүүхэд, залуучуудыг зөвхөн мэдлэгтэй байхаас гадна амьдралд бие даан оролцох чадвартай, хариуцлагатай иргэн болгон төлөвшүүлэхэд чиглэдэг. Тус хөтөлбөр нь Youth Programme Framework, Learning by Doing, Personal Progression зэрэг олон улсын скаутын үндсэн зарчимд тулгуурлан хувь хүний тасралтгүй хөгжил, манлайллыг дэмжин хэрэгждэг.':
      'The scout programme aims not only to give children and young people knowledge, but to shape them into responsible citizens able to take part in life independently. It is delivered on the basis of core international scouting principles such as the Youth Programme Framework, Learning by Doing and Personal Progression, supporting continuous personal growth and leadership.',
    'Удирдагч багш нарт': 'For leader teachers',
    'Кабын удирдагч багш - ач холбогдол': 'The cub leader teacher — why it matters',
    'Кабын удирдагч багш нь хүүхдийн хөгжлийг зөвхөн академик боловсролын хүрээнд бус, амьдралын ур чадвар, үнэт зүйл, зан төлөвөөр нь төлөвшүүлэхэд чиглэсэн чухал үүрэгтэй. Багш сурагчийн харилцаа нь энгийн хичээлийн харилцаанаас давж, итгэлцэл, харилцан хүндлэл, дэмжлэгт суурилсан түншлэл болон гүнзгийрдэг. Ингэснээр сахилга бат нь гаднаас тулгасан шаардлага биш, харин хүүхдийн дотоод ухамсар, өөрийн хариуцлага дээр тулгуурлан төлөвшдөг.':
      'The cub leader teacher plays a vital role in shaping children not only academically, but through life skills, values and character. The teacher–pupil relationship goes beyond ordinary lessons, deepening into a partnership built on trust, mutual respect and support. In this way discipline forms not as an external demand, but on the basis of the child’s inner awareness and personal responsibility.',
    'Мэргэжлийн хөгжил': 'Professional development',
    'Сургалтын шаталсан тогтолцоо': 'A tiered training system',
    'General Information Training → Basic Unit Leader Training Course → Advanced Unit Leader Training Course (Woodbadge) гэсэн шаталсан сургалтын систем нь скаутын удирдагч, багш нарыг тасралтгүй хөгжүүлдэг. Энэхүү тогтолцоо нь оролцогчдыг анхан шатнаас эхлэн манлайлагч түвшинд хүрэх хүртэл системтэйгээр хөгжүүлэх онцлогтой.':
      'The tiered system — General Information Training → Basic Unit Leader Training Course → Advanced Unit Leader Training Course (Wood Badge) — continuously develops scout leaders and teachers. It systematically grows participants from the very basics up to the leader level.',
    'Ерөнхий мэдээлэл олгох сургалт · 8 цаг · 1 өдөр': 'General information course · 8 hours · 1 day',
    'Хүүхэд, залуучууд, багш сурган хүмүүжүүлэгчид болон скаутын үйл ажиллагааг сонирхож буй хэн бүхэнд зориулсан анхан шатны танин мэдэхүйн сургалт юм.':
      'An introductory orientation course for children, young people, teachers, educators and anyone interested in scouting.',
    'Мэдлэгийн түвшинд': 'Knowledge level',
    'Арга зүйн түвшинд': 'Methodology level',
    'Хандлага, хүмүүжлийн түвшинд': 'Attitude and character level',
    'Скаутын хөдөлгөөний үүсэл, хөгжил': 'The origin and growth of the scouting movement',
    'Зорилго, үнэт зүйлс': 'Aims and values',
    'Андгай, хууль, үндсэн зарчим': 'Promise, law and core principles',
    'Нийгэмд чиглэсэн сайн дурын үйл ажиллагааны ач холбогдол':
      'The value of community-oriented volunteering',
    '"Learning by Doing" зарчим': 'The "Learning by Doing" principle',
    'Тоглоомд суурилсан сургалт': 'Play-based learning',
    'Багаар ажиллах арга зүй': 'Teamwork methodology',
    'Хамтын ажиллагаанд суурилсан оролцооны хэлбэр': 'Participation based on collaboration',
    'Хариуцлагатай, идэвхтэй иргэн байх': 'Being a responsible, active citizen',
    'Өөртөө итгэх итгэл': 'Self-confidence',
    'Бусдад туслах, сайн үйлс хийх': 'Helping others and doing good',
    'Хамт олноо хүндлэх, ойлгох': 'Respecting and understanding your peers',
    'Үндсэн багшийн сургалт · 2–3 өдөр': 'Basic leader course · 2–3 days',
    'Анхан шатны ойлголтыг практикт нэвтрүүлж, баг удирдах ур чадвар хөгжүүлэх төвтэй. Зорилго: Скаутын бүлгийн үйл ажиллагааг удирдах чадвар эзэмшүүлэх. Оролцогчид: Кабын багш, залуу удирдагч.':
      'Centred on putting the basics into practice and developing team-leading skills. Aim: to build the ability to lead a scout group’s activities. Participants: cub teachers and young leaders.',
    'Скаутын бүлэг удирдах бүтэц, үүрэг': 'The structure and roles of leading a scout group',
    'Хүүхдийн хөгжлийн үе шат, зан төлөвийн онцлог': 'Stages of child development and behavioural traits',
    'Аюулгүй, оролцоотой сургалтын орчин бүрдүүлэх': 'Creating a safe, participatory learning environment',
    'Багаар ажиллах, хамтын ажиллагааг удирдах': 'Leading teamwork and collaboration',
    'Тоглоом, сорил, дадлага дээр суурилсан "Learning by Doing"':
      '"Learning by Doing" based on games, challenges and practice',
    'Хүүхдийн зан төлөв, хандлага ажиглах, зөв чиглүүлэх':
      'Observing and rightly guiding children’s behaviour and attitudes',
    'Манлайлагчийн хандлага төлөвшүүлэх': 'Developing a leader’s mindset',
    'Өөртөө итгэлтэй, хүүхэд төвтэй багш болох': 'Becoming a confident, child-centred teacher',
    'Багаар ажиллах, асуудлыг зөвшилцлөөр шийдэх чадвар': 'Teamwork and solving problems by consensus',
    'Модон Тэмдэгт (Woodbadge) · 5–7 өдөр': 'Wood Badge · 5–7 days',
    'Системтэй, стратегийн түвшинд манлайлах ур чадвар эзэмшүүлэхэд чиглэнэ. Зорилго: Багш, удирдагчийг жирийн удирдагчаас манлайлагч түвшинд хөгжүүлэх. Оролцогчид: Кабын удирдагч багш нар, туршлагатай скаутын удирдагчид.':
      'Focused on building systematic, strategic-level leadership skills. Aim: to develop teachers and leaders from ordinary leaders into true leaders. Participants: cub leader teachers and experienced scout leaders.',
    'Скаутын дэлхийн түвшний хөгжлийн үзэл баримтлал': 'World-level scouting development concepts',
    'Хөтөлбөр, арга зүйг сургалтын стратегиар удирдах': 'Leading programme and methodology with a training strategy',
    'Скаутын хөдөлгөөний манлайлагчийн үүрэг, хариуцлага': 'The role and responsibilities of a scouting leader',
    'Комплекс дасгал, кейс судалгаа дээр ажиллах': 'Working on complex exercises and case studies',
    'Багийн үйл ажиллагаа, сургалтын үр дүнг үнэлэх': 'Evaluating team activities and training outcomes',
    'Дэмжлэгт, оролцоонд суурилсан менежмент': 'Supportive, participatory management',
    'Лидерийн үнэт зүйл, үлгэрлэлийг төлөвшүүлэх': 'Developing leadership values and role-modelling',
    'Багаас сургалт авч, бусдад манлайлах': 'Learning from the team and leading others',
    'Өөрийгөө хөгжүүлж, хүүхдийг зөв удирдах ур чадвар эзэмших':
      'Developing yourself and gaining the skills to guide children well',
    'Скаутын удирдагч гэж хэн бэ?': 'Who is a scout leader?',
    'Скаутын удирдагч гэдэг нь хүүхэд, залуучуудыг хамтын, аюулгүй, идэвхтэй орчинд хөгжүүлэхэд чиглэсэн зөвхөн багш бус, манлайлагч юм. Хүүхдийн зан төлөв, чадвар, үнэт зүйлсийг төлөвшүүлэхэд чиглэж, сургалтын орчныг аюулгүй, оролцоотой, эерэг байлгах үүрэгтэй. Өөрийн үлгэрлэлээр нөлөөлж, хүүхдийг шүүх бус, зөв чиглүүлэх аргаар хөгжүүлдэг.':
      'A scout leader is not just a teacher but a leader, focused on developing children and young people in a collaborative, safe and active environment. They work to shape children’s character, skills and values, and are responsible for keeping the learning environment safe, participatory and positive. They lead by example, developing children by guiding rather than judging them.',
    'Скаутын удирдагч нь зөвхөн мэдлэг дамжуулагч бус, хүүхэд төвтэй, үнэт зүйлсэд суурилсан манлайлагч юм. Түүний үйл ажиллагаа нь хүүхдийн өөртөө итгэх итгэл, оролцоо, бие даасан байдлыг хөгжүүлж, багийн хамтын ажиллагаа, харилцан хүндлэлийг бэхжүүлдэг.':
      'A scout leader is not merely a transmitter of knowledge, but a child-centred, values-based leader. Their work develops children’s self-confidence, participation and independence, and strengthens team collaboration and mutual respect.',
  };

  const TEXT_ORIG = new WeakMap();   // textNode  → original MN string
  const ATTR_ORIG = new WeakMap();   // element   → original placeholder
  const ORIG_TITLE = document.title;

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

  /* ── Collect translatable text nodes under `root` ── */
  function textNodes(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const p = n.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA')
          return NodeFilter.FILTER_REJECT;
        if (p.closest('[data-no-i18n]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const out = [];
    while (walker.nextNode()) out.push(walker.currentNode);
    return out;
  }

  function applyToTextNodes(nodes, lang) {
    nodes.forEach(n => {
      if (!TEXT_ORIG.has(n)) TEXT_ORIG.set(n, n.nodeValue);
      const orig = TEXT_ORIG.get(n);
      if (lang === 'en') {
        const en = DICT[norm(orig)];
        if (en != null) {
          const lead = orig.match(/^\s*/)[0];
          const trail = orig.match(/\s*$/)[0];
          n.nodeValue = lead + en + trail;
        }
      } else {
        n.nodeValue = orig;
      }
    });
  }

  function applyToAttrs(root, lang) {
    root.querySelectorAll('[placeholder]').forEach(el => {
      if (el.closest('[data-no-i18n]')) return;
      if (!ATTR_ORIG.has(el)) ATTR_ORIG.set(el, el.getAttribute('placeholder'));
      const orig = ATTR_ORIG.get(el);
      if (lang === 'en') {
        const en = DICT[norm(orig)];
        if (en != null) el.setAttribute('placeholder', en);
      } else {
        el.setAttribute('placeholder', orig);
      }
    });
  }

  function applyLang(lang) {
    applyToTextNodes(textNodes(document.body), lang);
    applyToAttrs(document.body, lang);
    document.documentElement.lang = lang;
    if (lang === 'en') {
      const t = DICT[norm(ORIG_TITLE)];
      if (t) document.title = t;
    } else {
      document.title = ORIG_TITLE;
    }
  }

  let current = 'mn';
  try { current = localStorage.getItem(KEY) === 'en' ? 'en' : 'mn'; } catch (e) {}

  /* ── Language toggle button (auto-injected into the nav) ── */
  const GLOBE = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg>`;

  function buildButton() {
    const nav = document.querySelector('nav .nav-inner');
    if (!nav) return null;
    const btn = document.createElement('button');
    btn.className = 'lang-switch';
    btn.type = 'button';
    btn.setAttribute('data-no-i18n', '');
    btn.addEventListener('click', () => {
      current = current === 'en' ? 'mn' : 'en';
      try { localStorage.setItem(KEY, current); } catch (e) {}
      applyLang(current);
      paint();
    });
    const hamburger = nav.querySelector('.nav-hamburger');
    if (hamburger) nav.insertBefore(btn, hamburger);
    else nav.appendChild(btn);
    return btn;
  }

  function paint() {
    if (!btn) return;
    const target = current === 'en' ? 'МН' : 'EN';
    btn.innerHTML = `${GLOBE}<span>${target}</span>`;
    btn.setAttribute('aria-label', current === 'en' ? 'Монгол хэл рүү шилжих' : 'Switch to English');
  }

  const btn = buildButton();
  paint();

  if (current === 'en') applyLang('en');

  /* ── Re-translate dynamically added content (events list, etc.) ── */
  if (window.MutationObserver) {
    const mo = new MutationObserver(muts => {
      if (current !== 'en') return;
      for (const m of muts) {
        m.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.closest('[data-no-i18n]')) return;
            applyToTextNodes(textNodes(node), 'en');
            applyToAttrs(node, 'en');
          }
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }
})();
