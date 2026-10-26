/*
 * Greppo content registry (data, not engine).
 *
 * All course content lives here as plain data with stable IDs. The engine in
 * index.html reads this, validates it, and compiles the declarative `check`
 * objects into predicates. Adding a level/lesson/task = editing data here only;
 * the engine never needs to change.
 *
 * Task shapes:
 *   teach  : { id, show:"text with <b>command</b>", cmd:"command", check:{...} }
 *   recall : { id, ask:"question (no command shown)", cmd:"command", check:{...} }
 *
 * Check vocabulary (all paths may use ~, .., .):
 *   {ran:"pwd"}                    last command name equals
 *   {ranArg:["cd",".."]}          command + first argument equals
 *   {cd:"~/games"}                command is cd AND cwd is now this path
 *   {cdHome:true}                 command is cd with no arg or ~
 *   {cwd:"~/games"}               cwd is now this path (any command)
 *   {cat:"~/welcome.txt"}         last file read with cat is this path
 *   {exists:"~/den"}              node exists
 *   {gone:"~/den/spare.txt"}      node does not exist
 *   {fileHas:["~/f.txt","hi"]}    file exists and its content contains text
 *   {out:["find","ball.txt"]}     last command is X and its output contains text
 *   {argHas:["head","poem.txt"]}  command is X and its arguments contain text
 *   {and:[...]} / {or:[...]}       combine
 */
window.GREPPO = {
  version: 1,

  /* Pet evolution stages: egg, one per level completed, then MEGA.
   * Length should be levels.length + 1. */
  stageNames: ["Egg", "Hatchling", "Junior", "Fighter", "Champion", "Scout",
               "Ranger", "Pilot", "Captain", "Hero", "MEGA"],

  /* 5-letter default/fallback words (actual word per run is random, see wordPool). */
  wordPool: ["ROBOT","LINUX","PILOT","SCOUT","ORDER","SPACE","LASER","MAGIC",
             "TIGER","PIXEL","NINJA","COMET","DRONE","POWER","BRAVE","CLOUD",
             "SOLAR","ROCKY","SUPER","FROST","RIVER","STONE","FLAME"],

  /* Knowledge base: the single source for the in-game `help` list. */
  knowledge: [
    {cmd:"pwd",   sum:"print working directory — shows where you are"},
    {cmd:"ls",    sum:"list the files and folders here (ls -a also shows hidden ones)"},
    {cmd:"cd",    sum:"change directory: cd folder, cd .. goes up, cd ~ goes home"},
    {cmd:"cat",   sum:"show what is inside a file"},
    {cmd:"tree",  sum:"show all folders as a tree"},
    {cmd:"mkdir", sum:"make a new folder"},
    {cmd:"touch", sum:"make a new empty file"},
    {cmd:"echo",  sum:"print text; echo hi > note.txt writes it into a file"},
    {cmd:"cp",    sum:"copy a file: cp a b"},
    {cmd:"mv",    sum:"move or rename: mv a b"},
    {cmd:"rm",    sum:"remove (delete); rm -r folder deletes a folder"},
    {cmd:"find",  sum:"search for a file by its name"},
    {cmd:"grep",  sum:"search for a word inside files"},
    {cmd:"head",  sum:"show the first lines of a file"},
    {cmd:"tail",  sum:"show the last lines of a file"},
    {cmd:"wc",    sum:"count the lines, words and letters in a file"},
    {cmd:"sort",  sum:"show a file's lines in A-Z order"},
    {cmd:"uniq",  sum:"remove repeated lines that are next to each other"},
    {cmd:"rev",   sum:"flip a file's text backwards"},
    {cmd:"tr",    sum:"swap letters: tr a-z A-Z makes it SHOUT in capitals"},
    {cmd:"cut",   sum:"take parts of each line: cut -c1-3 file"},
    {cmd:"nl",    sum:"number every line of a file"},
    {cmd:"whoami",sum:"print your name"},
    {cmd:"date",  sum:"show the date and time"},
    {cmd:"cal",   sum:"show a calendar"},
    {cmd:"history",sum:"show the commands you typed"},
    {cmd:"clear", sum:"clear the screen"},
    {cmd:"help",  sum:"show this list of commands"}
  ],

  /* The 12-region world map (course roadmap). Regions marked "ready" are
   * playable now and point to the level ids that implement them; "soon"
   * regions are planned and shown under fog on the map. */
  roadmap: [
    {n:1,  title:"Valley of Files",            teach:"pwd, ls, cd, paths, viewing files",        status:"ready", levelIds:["nav"]},
    {n:2,  title:"Workshop",                   teach:"make, copy, move, delete, wildcards",      status:"ready", levelIds:["make"]},
    {n:3,  title:"Lands of Seekers",           teach:"find, grep, head, tail, wc, sort, uniq",   status:"ready", levelIds:["seek","view","order"]},
    {n:4,  title:"Mirror & Cutting Rooms",     teach:"rev, tr (SHOUT), cut, nl",                 status:"ready", levelIds:["flip","slice"]},
    {n:5,  title:"Crossroads of Streams",      teach:"pipes | — join commands together",        status:"ready", levelIds:["pipe","flow"]},
    {n:6,  title:"Tower of Names",             teach:"variables, $USER, whoami, date, cal",      status:"ready", levelIds:["vars"]},
    {n:7,  title:"Citadel of Access",          teach:"users, groups, chmod, chown, sudo",        status:"soon"},
    {n:8,  title:"Underground Paths",          teach:"links, /dev /proc /sys, df, du",           status:"soon"},
    {n:9,  title:"Machine Yard",               teach:"processes, PID, signals, background jobs", status:"soon"},
    {n:10, title:"Control Center",             teach:"system, logs, PATH, services, packages",   status:"soon"},
    {n:11, title:"Network Frontier",           teach:"network, DNS, HTTP, SSH, Git",             status:"soon"},
    {n:12, title:"Automation Lab",             teach:"bash scripts, args, loops, functions",     status:"soon"}
  ],

  /* Spaced-repetition review questions, one canonical per command. */
  review: {
    pwd:  {ask:"Review: show where you are.", cmd:"pwd", check:{ran:"pwd"}},
    ls:   {ask:"Review: list everything here.", cmd:"ls", check:{ran:"ls"}},
    cd:   {ask:"Review: go into the folder games.", cmd:"cd games", check:{cd:"~/games"}},
    cat:  {ask:"Review: read ~/welcome.txt.", cmd:"cat ~/welcome.txt", check:{cat:"~/welcome.txt"}},
    tree: {ask:"Review: show the whole tree.", cmd:"tree", check:{ran:"tree"}},
    mkdir:{ask:"Review: make a folder ~/review.", cmd:"mkdir ~/review", check:{exists:"~/review"}},
    touch:{ask:"Review: make a file ~/review-note.txt.", cmd:"touch ~/review-note.txt", check:{exists:"~/review-note.txt"}},
    echo: {ask:"Review: write hi into ~/review-note.txt.", cmd:"echo hi > ~/review-note.txt", check:{fileHas:["~/review-note.txt","hi"]}},
    cp:   {ask:"Review: copy ~/welcome.txt to ~/welcome2.txt.", cmd:"cp ~/welcome.txt ~/welcome2.txt", check:{exists:"~/welcome2.txt"}},
    mv:   {ask:"Review: rename ~/welcome2.txt to ~/renamed.txt.", cmd:"mv ~/welcome2.txt ~/renamed.txt", check:{exists:"~/renamed.txt"}},
    rm:   {ask:"Review: delete ~/renamed.txt.", cmd:"rm ~/renamed.txt", check:{gone:"~/renamed.txt"}},
    find: {ask:"Review: find ball.txt.", cmd:"find ball.txt", check:{out:["find","ball.txt"]}},
    grep: {ask:"Review: search for the word treasure.", cmd:"grep treasure", check:{out:["grep","treasure"]}},
    head: {ask:"Review: show the first lines of library/poem.txt.", cmd:"head library/poem.txt", check:{argHas:["head","poem.txt"]}},
    tail: {ask:"Review: show the last lines of library/poem.txt.", cmd:"tail library/poem.txt", check:{argHas:["tail","poem.txt"]}},
    wc:   {ask:"Review: count library/animals.txt.", cmd:"wc library/animals.txt", check:{argHas:["wc","animals.txt"]}},
    sort: {ask:"Review: sort library/animals.txt.", cmd:"sort library/animals.txt", check:{argHas:["sort","animals.txt"]}},
    uniq: {ask:"Review: remove repeats in library/animals.txt.", cmd:"uniq library/animals.txt", check:{argHas:["uniq","animals.txt"]}}
  },

  levels: [
    /* ---------------- Level 1 ---------------- */
    {id:"nav", word:"ROBOT", title:"Valley of Files", lessons:[
      {id:"nav.look", title:"pwd + ls — look around", letters:[0], tasks:[
        {id:"nav.look.1", show:"Where am I? Type <b>pwd</b> — print working directory", cmd:"pwd", check:{ran:"pwd"}},
        {id:"nav.look.2", show:"What is here? Type <b>ls</b> — list files and folders", cmd:"ls", check:{ran:"ls"}},
        {id:"nav.look.3", ask:"Which command shows where you are? Type it.", cmd:"pwd", check:{ran:"pwd"}}
      ]},
      {id:"nav.move", title:"cd — move between folders", letters:[1], tasks:[
        {id:"nav.move.1", show:"Go into the folder games. Type <b>cd games</b> — change directory", cmd:"cd games", check:{cd:"~/games"}},
        {id:"nav.move.2", show:"Go up one folder. Type <b>cd ..</b>", cmd:"cd ..", check:{ranArg:["cd",".."]}},
        {id:"nav.move.3", ask:"Go into the folder pictures.", cmd:"cd pictures", check:{cd:"~/pictures"}},
        {id:"nav.move.4", ask:"Which command takes you to your home folder? Type it.", cmd:"cd ~", check:{cdHome:true}}
      ]},
      {id:"nav.read", title:"cat — read files", letters:[2], tasks:[
        {id:"nav.read.1", show:"Read the file welcome.txt. Type <b>cat welcome.txt</b>. The .txt means it is a text file", cmd:"cat welcome.txt", check:{cat:"~/welcome.txt"}},
        {id:"nav.read.2", ask:"Read the file games/secret.txt.", cmd:"cat games/secret.txt", check:{cat:"~/games/secret.txt"}},
        {id:"nav.read.3", ask:"Which command reads a file? Use it to read box/clue.txt.", cmd:"cat box/clue.txt", check:{cat:"~/box/clue.txt"}}
      ]},
      {id:"nav.map", title:"tree + paths", letters:[3], tasks:[
        {id:"nav.map.1", show:"See all folders as a tree. Use the command <b>tree</b>", cmd:"tree", check:{ran:"tree"}},
        {id:"nav.map.2", ask:"Go into the folder box, then into toys.", cmd:"cd box/toys", check:{cd:"~/box/toys"}},
        {id:"nav.map.3", ask:"Which one-word command shows the whole tree? Type it.", cmd:"tree", check:{ran:"tree"}}
      ]},
      {id:"nav.check", title:"Checkpoint — answer from memory", checkpoint:true, letters:[4], tasks:[
        {id:"nav.check.1", ask:"Show where you are.", cmd:"pwd", check:{ran:"pwd"}},
        {id:"nav.check.2", ask:"List everything here.", cmd:"ls", check:{ran:"ls"}},
        {id:"nav.check.3", ask:"Go into the folder games.", cmd:"cd games", check:{cd:"~/games"}},
        {id:"nav.check.4", ask:"Now go back to your home folder.", cmd:"cd ~", check:{cdHome:true}},
        {id:"nav.check.5", ask:"Read the file welcome.txt.", cmd:"cat welcome.txt", check:{cat:"~/welcome.txt"}},
        {id:"nav.check.6", ask:"Show all folders as a tree.", cmd:"tree", check:{ran:"tree"}}
      ]}
    ]},

    /* ---------------- Level 2 ---------------- */
    {id:"make", word:"LINUX", title:"Workshop", lessons:[
      {id:"make.create", title:"mkdir + touch — make things", letters:[0], tasks:[
        {id:"make.create.1", show:"Make a new folder called den. Type <b>mkdir den</b> — make directory", cmd:"mkdir den", check:{exists:"~/den"}},
        {id:"make.create.2", show:"Make an empty file inside it. Use <b>touch den/bowl.txt</b> — touch makes an empty file", cmd:"touch den/bowl.txt", check:{exists:"~/den/bowl.txt"}},
        {id:"make.create.3", ask:"Make a new folder called toys", cmd:"mkdir toys", check:{exists:"~/toys"}}
      ]},
      {id:"make.write", title:"echo > — write into files", letters:[1], tasks:[
        {id:"make.write.1", show:"Write a word into a file. Use <b>echo food > den/bowl.txt</b> — the > sends the word into the file", cmd:"echo food > den/bowl.txt", check:{fileHas:["~/den/bowl.txt","food"]}},
        {id:"make.write.2", ask:"Add the word <span class=\"kw\">yummy</span> to the end of den/bowl.txt. Use >> to keep the old text", cmd:"echo yummy >> den/bowl.txt", check:{fileHas:["~/den/bowl.txt","yummy"]}},
        {id:"make.write.3", ask:"Create a new file hello.txt with the word <span class=\"kw\">hi</span> inside. Use echo with > to make the file", cmd:"echo hi > hello.txt", check:{fileHas:["~/hello.txt","hi"]}}
      ]},
      {id:"make.copy", title:"cp + mv — copy and rename", letters:[2], tasks:[
        {id:"make.copy.1", show:"Copy the bowl. Type <b>cp den/bowl.txt den/bowl2.txt</b> — copy", cmd:"cp den/bowl.txt den/bowl2.txt", check:{exists:"~/den/bowl2.txt"}},
        {id:"make.copy.2", ask:"Rename den/bowl2.txt to den/spare.txt.", cmd:"mv den/bowl2.txt den/spare.txt", check:{and:[{gone:"~/den/bowl2.txt"},{exists:"~/den/spare.txt"}]}},
        {id:"make.copy.3", ask:"Go into the folder den (an old skill!).", cmd:"cd den", check:{cd:"~/den"}}
      ]},
      {id:"make.remove", title:"rm + flags — delete, be careful", letters:[3], tasks:[
        {id:"make.remove.1", show:"Delete the spare file. Use <b>rm ~/den/spare.txt</b> — rm removes a file", cmd:"rm ~/den/spare.txt", check:{gone:"~/den/spare.txt"}},
        {id:"make.remove.2", show:"A flag is an extra option that starts with a dash -. To delete a whole folder, add the flag -r. Use <b>rm -r ~/den/toys</b>", cmd:"rm -r ~/den/toys", check:{gone:"~/den/toys"}},
        {id:"make.remove.3", ask:"Now delete the folder <span class=\"kw\">toys</span> in your home, using the same -r flag", cmd:"rm -r ~/toys", check:{gone:"~/toys"}},
        {id:"make.remove.4", ask:"Which command deletes things? Delete the file ~/hello.txt", cmd:"rm ~/hello.txt", check:{gone:"~/hello.txt"}}
      ]},
      {id:"make.check", title:"Checkpoint — answer from memory", checkpoint:true, letters:[4], tasks:[
        {id:"make.check.1", ask:"Make a new folder called test.", cmd:"mkdir test", check:{exists:"~/test"}},
        {id:"make.check.2", ask:"Make a file called test/a.txt.", cmd:"touch test/a.txt", check:{exists:"~/test/a.txt"}},
        {id:"make.check.3", ask:"Write the word ok into test/a.txt.", cmd:"echo ok > test/a.txt", check:{fileHas:["~/test/a.txt","ok"]}},
        {id:"make.check.4", ask:"Copy test/a.txt to test/b.txt.", cmd:"cp test/a.txt test/b.txt", check:{exists:"~/test/b.txt"}},
        {id:"make.check.5", ask:"Rename test/b.txt to test/c.txt.", cmd:"mv test/b.txt test/c.txt", check:{and:[{gone:"~/test/b.txt"},{exists:"~/test/c.txt"}]}},
        {id:"make.check.6", ask:"Delete the whole folder test.", cmd:"rm -r test", check:{gone:"~/test"}}
      ]}
    ]},

    /* ---------------- Level 3 ---------------- */
    {id:"seek", word:"PILOT", title:"Lands of Seekers", lessons:[
      {id:"seek.find", title:"find — search by name", letters:[0], tasks:[
        {id:"seek.find.1", show:"Search for a file by name. Use <b>find ball.txt</b>", cmd:"find ball.txt", check:{out:["find","ball.txt"]}},
        {id:"seek.find.2", ask:"Find the file robot-toy.txt.", cmd:"find robot-toy.txt", check:{out:["find","robot-toy.txt"]}},
        {id:"seek.find.3", ask:"Which command finds a file by its name? Find ball.txt.", cmd:"find ball.txt", check:{out:["find","ball.txt"]}}
      ]},
      {id:"seek.grep", title:"grep — search inside files", letters:[1], tasks:[
        {id:"seek.grep.1", show:"Search for a word inside files. Use <b>grep greppo notes/diary.txt</b>", cmd:"grep greppo notes/diary.txt", check:{out:["grep","greppo"]}},
        {id:"seek.grep.2", ask:"Search everywhere for the word treasure.", cmd:"grep treasure", check:{out:["grep","treasure"]}},
        {id:"seek.grep.3", ask:"Which command searches inside files? Search for the word pet.", cmd:"grep pet", check:{out:["grep","pet"]}}
      ]},
      {id:"seek.star", title:"* the star (wildcards)", letters:[2], tasks:[
        {id:"seek.star.1", show:"List only text files. Type <b>ls *.txt</b> — the star means \"anything\"", cmd:"ls *.txt", check:{argHas:["ls","*"]}},
        {id:"seek.star.2", ask:"Find files with toy in the name, using the star.", cmd:"find *toy*", check:{and:[{argHas:["find","*"]},{out:["find","toy"]}]}},
        {id:"seek.star.3", ask:"Go into the folder box, then toys (an old skill!).", cmd:"cd box/toys", check:{cd:"~/box/toys"}}
      ]},
      {id:"seek.mix", title:"Mix — old and new together", letters:[3], tasks:[
        {id:"seek.mix.1", ask:"Show where you are.", cmd:"pwd", check:{ran:"pwd"}},
        {id:"seek.mix.2", ask:"Make a new folder called logs.", cmd:"mkdir logs", check:{exists:"~/logs"}},
        {id:"seek.mix.3", ask:"Search for the word pet.", cmd:"grep pet", check:{out:["grep","pet"]}}
      ]},
      {id:"seek.check", title:"Checkpoint — the quest", checkpoint:true, letters:[4], tasks:[
        {id:"seek.check.1", ask:"Show where you are.", cmd:"pwd", check:{ran:"pwd"}},
        {id:"seek.check.2", ask:"Find the file robot-toy.txt.", cmd:"find robot-toy.txt", check:{out:["find","robot-toy.txt"]}},
        {id:"seek.check.3", ask:"Go into the folder box, then toys.", cmd:"cd box/toys", check:{cd:"~/box/toys"}},
        {id:"seek.check.4", ask:"Read the file robot-toy.txt.", cmd:"cat robot-toy.txt", check:{cat:"~/box/toys/robot-toy.txt"}},
        {id:"seek.check.5", ask:"Go back to your home folder.", cmd:"cd ~", check:{cdHome:true}},
        {id:"seek.check.6", ask:"Open the treasure: read ~/treasure.txt.", cmd:"cat ~/treasure.txt", check:{cat:"~/treasure.txt"}}
      ]}
    ]},

    /* ---------------- Level 4 (new) ---------------- */
    {id:"view", word:"SCOUT", title:"Reading Room", lessons:[
      {id:"view.peek", title:"head + tail — peek at a file", letters:[0], tasks:[
        {id:"view.peek.1", show:"Peek at the first lines of a file. Use <b>head library/poem.txt</b> — head shows the top", cmd:"head library/poem.txt", check:{argHas:["head","poem.txt"]}},
        {id:"view.peek.2", show:"See the last lines. Use <b>tail library/poem.txt</b> — tail shows the bottom", cmd:"tail library/poem.txt", check:{argHas:["tail","poem.txt"]}},
        {id:"view.peek.3", ask:"Which command shows the FIRST lines of a file? Use it on library/poem.txt.", cmd:"head library/poem.txt", check:{argHas:["head","poem.txt"]}}
      ]},
      {id:"view.count", title:"wc — count lines and words", letters:[1], tasks:[
        {id:"view.count.1", show:"Count the lines and words in a file. Use <b>wc library/poem.txt</b> — word count", cmd:"wc library/poem.txt", check:{argHas:["wc","poem.txt"]}},
        {id:"view.count.2", ask:"Count what is in library/animals.txt.", cmd:"wc library/animals.txt", check:{argHas:["wc","animals.txt"]}},
        {id:"view.count.3", ask:"Read the whole poem with cat (an old skill!). The file is library/poem.txt.", cmd:"cat library/poem.txt", check:{cat:"~/library/poem.txt"}}
      ]},
      {id:"view.mix", title:"Mix — move in and look", letters:[2], tasks:[
        {id:"view.mix.1", ask:"Go into the folder library.", cmd:"cd library", check:{cd:"~/library"}},
        {id:"view.mix.2", ask:"List what is there.", cmd:"ls", check:{ran:"ls"}},
        {id:"view.mix.3", ask:"Show the last lines of poem.txt.", cmd:"tail poem.txt", check:{argHas:["tail","poem.txt"]}}
      ]},
      {id:"view.more", title:"Practice — top, bottom, count", letters:[3], tasks:[
        {id:"view.more.1", ask:"Show the first lines of library/numbers.txt.", cmd:"head library/numbers.txt", check:{argHas:["head","numbers.txt"]}},
        {id:"view.more.2", ask:"Count library/numbers.txt.", cmd:"wc library/numbers.txt", check:{argHas:["wc","numbers.txt"]}},
        {id:"view.more.3", ask:"Read library/numbers.txt with cat.", cmd:"cat library/numbers.txt", check:{cat:"~/library/numbers.txt"}}
      ]},
      {id:"view.check", title:"Checkpoint — answer from memory", checkpoint:true, letters:[4], tasks:[
        {id:"view.check.1", ask:"Show where you are.", cmd:"pwd", check:{ran:"pwd"}},
        {id:"view.check.2", ask:"Show the first lines of library/poem.txt.", cmd:"head library/poem.txt", check:{argHas:["head","poem.txt"]}},
        {id:"view.check.3", ask:"Show the last lines of library/poem.txt.", cmd:"tail library/poem.txt", check:{argHas:["tail","poem.txt"]}},
        {id:"view.check.4", ask:"Count library/animals.txt.", cmd:"wc library/animals.txt", check:{argHas:["wc","animals.txt"]}},
        {id:"view.check.5", ask:"Read library/animals.txt with cat.", cmd:"cat library/animals.txt", check:{cat:"~/library/animals.txt"}}
      ]}
    ]},

    /* ---------------- Level 5 (new) ---------------- */
    {id:"order", word:"ORDER", title:"Sorting Hall", lessons:[
      {id:"order.sort", title:"sort — put lines in order", letters:[0], tasks:[
        {id:"order.sort.1", show:"Put a file's lines in A-Z order. Use <b>sort library/animals.txt</b>", cmd:"sort library/animals.txt", check:{argHas:["sort","animals.txt"]}},
        {id:"order.sort.2", ask:"Sort library/numbers.txt.", cmd:"sort library/numbers.txt", check:{argHas:["sort","numbers.txt"]}},
        {id:"order.sort.3", ask:"Which command puts lines in order? Use it on library/animals.txt.", cmd:"sort library/animals.txt", check:{argHas:["sort","animals.txt"]}}
      ]},
      {id:"order.uniq", title:"uniq — remove repeats", letters:[1], tasks:[
        {id:"order.uniq.1", show:"Remove repeated lines that are next to each other. Use <b>uniq library/animals.txt</b>", cmd:"uniq library/animals.txt", check:{argHas:["uniq","animals.txt"]}},
        {id:"order.uniq.2", ask:"Remove repeats in library/numbers.txt.", cmd:"uniq library/numbers.txt", check:{argHas:["uniq","numbers.txt"]}},
        {id:"order.uniq.3", ask:"Sort library/numbers.txt first (an old skill).", cmd:"sort library/numbers.txt", check:{argHas:["sort","numbers.txt"]}}
      ]},
      {id:"order.mix", title:"Mix — count and order", letters:[2], tasks:[
        {id:"order.mix.1", ask:"Count library/animals.txt.", cmd:"wc library/animals.txt", check:{argHas:["wc","animals.txt"]}},
        {id:"order.mix.2", ask:"Sort library/animals.txt.", cmd:"sort library/animals.txt", check:{argHas:["sort","animals.txt"]}},
        {id:"order.mix.3", ask:"Show the first lines of library/animals.txt.", cmd:"head library/animals.txt", check:{argHas:["head","animals.txt"]}}
      ]},
      {id:"order.spiral", title:"Mix — search and order", letters:[3], tasks:[
        {id:"order.spiral.1", ask:"Find the file animals.txt.", cmd:"find animals.txt", check:{out:["find","animals.txt"]}},
        {id:"order.spiral.2", ask:"Make a new folder called sorted.", cmd:"mkdir sorted", check:{exists:"~/sorted"}},
        {id:"order.spiral.3", ask:"Sort library/numbers.txt.", cmd:"sort library/numbers.txt", check:{argHas:["sort","numbers.txt"]}}
      ]},
      {id:"order.check", title:"Final checkpoint", checkpoint:true, letters:[4], tasks:[
        {id:"order.check.1", ask:"Show where you are.", cmd:"pwd", check:{ran:"pwd"}},
        {id:"order.check.2", ask:"Sort library/animals.txt.", cmd:"sort library/animals.txt", check:{argHas:["sort","animals.txt"]}},
        {id:"order.check.3", ask:"Remove repeats in library/animals.txt.", cmd:"uniq library/animals.txt", check:{argHas:["uniq","animals.txt"]}},
        {id:"order.check.4", ask:"Count library/poem.txt.", cmd:"wc library/poem.txt", check:{argHas:["wc","poem.txt"]}},
        {id:"order.check.5", ask:"Read the treasure: ~/treasure.txt.", cmd:"cat ~/treasure.txt", check:{cat:"~/treasure.txt"}}
      ]}
    ]},

    /* ---------------- Level 6 — rev + tr ---------------- */
    {id:"flip", word:"MAGIC", title:"Mirror Hall", lessons:[
      {id:"flip.rev", title:"rev — flip text backwards", letters:[0], tasks:[
        {id:"flip.rev.1", show:"Flip a file's text backwards. Use <b>rev library/poem.txt</b>", cmd:"rev library/poem.txt", check:{argHas:["rev","poem.txt"]}},
        {id:"flip.rev.2", ask:"Flip library/colors.txt backwards.", cmd:"rev library/colors.txt", check:{argHas:["rev","colors.txt"]}},
        {id:"flip.rev.3", ask:"Which command flips text backwards? Use it on library/poem.txt.", cmd:"rev library/poem.txt", check:{argHas:["rev","poem.txt"]}}
      ]},
      {id:"flip.shout", title:"tr — SHOUT in capitals", letters:[1], tasks:[
        {id:"flip.shout.1", show:"Turn small letters into BIG letters. Use <b>tr a-z A-Z library/poem.txt</b> — tr swaps letters", cmd:"tr a-z A-Z library/poem.txt", check:{argHas:["tr","poem.txt"]}},
        {id:"flip.shout.2", ask:"Make library/colors.txt SHOUT in capitals.", cmd:"tr a-z A-Z library/colors.txt", check:{argHas:["tr","colors.txt"]}}
      ]},
      {id:"flip.swap", title:"tr — swap one letter", letters:[2], tasks:[
        {id:"flip.swap.1", show:"Swap every o for 0. Use <b>tr o 0 library/poem.txt</b>", cmd:"tr o 0 library/poem.txt", check:{argHas:["tr","poem.txt"]}},
        {id:"flip.swap.2", ask:"In library/colors.txt, swap every e for 3. (tr e 3 ...)", cmd:"tr e 3 library/colors.txt", check:{argHas:["tr","colors.txt"]}}
      ]},
      {id:"flip.mix", title:"Mix — old and new", letters:[3], tasks:[
        {id:"flip.mix.1", ask:"Read library/poem.txt with cat.", cmd:"cat library/poem.txt", check:{cat:"~/library/poem.txt"}},
        {id:"flip.mix.2", ask:"Flip library/poem.txt backwards.", cmd:"rev library/poem.txt", check:{argHas:["rev","poem.txt"]}},
        {id:"flip.mix.3", ask:"Print your own name. Type the command that does it.", cmd:"whoami", check:{ran:"whoami"}}
      ]},
      {id:"flip.check", title:"Checkpoint — from memory", checkpoint:true, letters:[4], tasks:[
        {id:"flip.check.1", ask:"Flip library/colors.txt backwards.", cmd:"rev library/colors.txt", check:{argHas:["rev","colors.txt"]}},
        {id:"flip.check.2", ask:"Make library/poem.txt SHOUT in capitals.", cmd:"tr a-z A-Z library/poem.txt", check:{argHas:["tr","poem.txt"]}},
        {id:"flip.check.3", ask:"Print your name.", cmd:"whoami", check:{ran:"whoami"}},
        {id:"flip.check.4", ask:"Read library/colors.txt with cat.", cmd:"cat library/colors.txt", check:{cat:"~/library/colors.txt"}}
      ]}
    ]},

    /* ---------------- Level 7 — cut + nl ---------------- */
    {id:"slice", word:"LASER", title:"Cutting Room", lessons:[
      {id:"slice.cut", title:"cut -c — take some letters", letters:[0], tasks:[
        {id:"slice.cut.1", show:"Take just the first 3 letters of each line. Use <b>cut -c1-3 library/colors.txt</b>", cmd:"cut -c1-3 library/colors.txt", check:{argHas:["cut","colors.txt"]}},
        {id:"slice.cut.2", ask:"Take just the first letter of each color. (cut -c1 ...)", cmd:"cut -c1 library/colors.txt", check:{argHas:["cut","colors.txt"]}}
      ]},
      {id:"slice.field", title:"cut -f — take a word column", letters:[1], tasks:[
        {id:"slice.field.1", show:"Each line of scores has a name and a number. Take the names: <b>cut -f1 library/scores.txt</b>", cmd:"cut -f1 library/scores.txt", check:{argHas:["cut","scores.txt"]}},
        {id:"slice.field.2", ask:"Now take just the scores (the second word): cut -f2 library/scores.txt", cmd:"cut -f2 library/scores.txt", check:{argHas:["cut","scores.txt"]}}
      ]},
      {id:"slice.nl", title:"nl — number the lines", letters:[2], tasks:[
        {id:"slice.nl.1", show:"Number every line of a file. Use <b>nl library/poem.txt</b>", cmd:"nl library/poem.txt", check:{argHas:["nl","poem.txt"]}},
        {id:"slice.nl.2", ask:"Number the lines of library/colors.txt.", cmd:"nl library/colors.txt", check:{argHas:["nl","colors.txt"]}}
      ]},
      {id:"slice.mix", title:"Mix — order and number", letters:[3], tasks:[
        {id:"slice.mix.1", ask:"Sort library/colors.txt (an old skill).", cmd:"sort library/colors.txt", check:{argHas:["sort","colors.txt"]}},
        {id:"slice.mix.2", ask:"Number the lines of library/colors.txt.", cmd:"nl library/colors.txt", check:{argHas:["nl","colors.txt"]}},
        {id:"slice.mix.3", ask:"What day is it? Type the command that shows the date.", cmd:"date", check:{ran:"date"}}
      ]},
      {id:"slice.check", title:"Checkpoint — from memory", checkpoint:true, letters:[4], tasks:[
        {id:"slice.check.1", ask:"Take the first 3 letters of each line in library/colors.txt.", cmd:"cut -c1-3 library/colors.txt", check:{argHas:["cut","colors.txt"]}},
        {id:"slice.check.2", ask:"Take the names from library/scores.txt (first word).", cmd:"cut -f1 library/scores.txt", check:{argHas:["cut","scores.txt"]}},
        {id:"slice.check.3", ask:"Number the lines of library/poem.txt.", cmd:"nl library/poem.txt", check:{argHas:["nl","poem.txt"]}},
        {id:"slice.check.4", ask:"Show a calendar.", cmd:"cal", check:{ran:"cal"}}
      ]}
    ]},

    /* ---------------- Level 8 — pipes (basics) ---------------- */
    {id:"pipe", word:"RIVER", title:"River of Streams", lessons:[
      {id:"pipe.first", title:"| — send one command into another", letters:[0], tasks:[
        {id:"pipe.first.1", show:"A pipe | sends one command's output into the next. Sort the animals: <b>cat library/animals.txt | sort</b>", cmd:"cat library/animals.txt | sort", check:{typed:["cat","|","sort"]}},
        {id:"pipe.first.2", ask:"Send the colors file into sort: cat library/colors.txt | sort", cmd:"cat library/colors.txt | sort", check:{typed:["colors.txt","|","sort"]}}
      ]},
      {id:"pipe.uniq", title:"| sort | uniq — remove repeats", letters:[1], tasks:[
        {id:"pipe.uniq.1", show:"Sort, then remove repeats. Type <b>cat library/animals.txt | sort | uniq</b>", cmd:"cat library/animals.txt | sort | uniq", check:{typed:["|","sort","uniq"]}},
        {id:"pipe.uniq.2", ask:"Do the same for library/scores.txt: sort then uniq.", cmd:"cat library/scores.txt | sort | uniq", check:{typed:["scores.txt","sort","uniq"]}}
      ]},
      {id:"pipe.count", title:"| wc — count what flows through", letters:[2], tasks:[
        {id:"pipe.count.1", show:"Count the lines that come through a pipe. Type <b>cat library/animals.txt | wc</b>", cmd:"cat library/animals.txt | wc", check:{typed:["animals.txt","|","wc"]}},
        {id:"pipe.count.2", ask:"Sort the animals and count them: cat library/animals.txt | sort | wc", cmd:"cat library/animals.txt | sort | wc", check:{typed:["sort","wc","|"]}}
      ]},
      {id:"pipe.grep", title:"| grep — keep only some lines", letters:[3], tasks:[
        {id:"pipe.grep.1", show:"Keep only lines with a word. Type <b>cat library/scores.txt | grep max</b>", cmd:"cat library/scores.txt | grep max", check:{typed:["scores.txt","|","grep"]}},
        {id:"pipe.grep.2", ask:"From library/scores.txt keep only robert's lines. (| grep robert)", cmd:"cat library/scores.txt | grep robert", check:{typed:["grep","robert"]}}
      ]},
      {id:"pipe.check", title:"Checkpoint — from memory", checkpoint:true, letters:[4], tasks:[
        {id:"pipe.check.1", ask:"Sort library/colors.txt with a pipe: cat ... | sort", cmd:"cat library/colors.txt | sort", check:{typed:["colors.txt","|","sort"]}},
        {id:"pipe.check.2", ask:"Sort and remove repeats in library/animals.txt.", cmd:"cat library/animals.txt | sort | uniq", check:{typed:["sort","uniq"]}},
        {id:"pipe.check.3", ask:"Count library/animals.txt through a pipe.", cmd:"cat library/animals.txt | wc", check:{typed:["|","wc"]}}
      ]}
    ]},

    /* ---------------- Level 9 — longer pipes ---------------- */
    {id:"flow", word:"CLOUD", title:"The Great Current", lessons:[
      {id:"flow.rev", title:"| rev — flip through a pipe", letters:[0], tasks:[
        {id:"flow.rev.1", show:"Send a file through rev with a pipe. Type <b>cat library/colors.txt | rev</b>", cmd:"cat library/colors.txt | rev", check:{typed:["colors.txt","|","rev"]}},
        {id:"flow.rev.2", ask:"Send library/poem.txt through rev.", cmd:"cat library/poem.txt | rev", check:{typed:["poem.txt","|","rev"]}}
      ]},
      {id:"flow.tr", title:"| tr — SHOUT through a pipe", letters:[1], tasks:[
        {id:"flow.tr.1", show:"SHOUT through a pipe. Type <b>cat library/colors.txt | tr a-z A-Z</b>", cmd:"cat library/colors.txt | tr a-z A-Z", check:{typed:["|","tr"]}},
        {id:"flow.tr.2", ask:"Send library/animals.txt through tr a-z A-Z.", cmd:"cat library/animals.txt | tr a-z A-Z", check:{typed:["animals.txt","|","tr"]}}
      ]},
      {id:"flow.big", title:"Long pipes — 3 steps", letters:[2], tasks:[
        {id:"flow.big.1", show:"A long pipe! Sort, remove repeats, then count: <b>cat library/scores.txt | sort | uniq | wc</b>", cmd:"cat library/scores.txt | sort | uniq | wc", check:{typed:["sort","uniq","wc"]}},
        {id:"flow.big.2", ask:"Do a 3-step pipe on library/animals.txt: sort then uniq then wc.", cmd:"cat library/animals.txt | sort | uniq | wc", check:{typed:["animals.txt","sort","uniq","wc"]}}
      ]},
      {id:"flow.mix", title:"Mix — pipes and old skills", letters:[3], tasks:[
        {id:"flow.mix.1", ask:"Show the commands you have typed. Type the command for that.", cmd:"history", check:{ran:"history"}},
        {id:"flow.mix.2", ask:"From library/colors.txt keep only the line with blue. (| grep blue)", cmd:"cat library/colors.txt | grep blue", check:{typed:["grep","blue"]}},
        {id:"flow.mix.3", ask:"Print your name.", cmd:"whoami", check:{ran:"whoami"}}
      ]},
      {id:"flow.check", title:"Checkpoint — from memory", checkpoint:true, letters:[4], tasks:[
        {id:"flow.check.1", ask:"Send library/colors.txt through rev with a pipe.", cmd:"cat library/colors.txt | rev", check:{typed:["colors.txt","|","rev"]}},
        {id:"flow.check.2", ask:"SHOUT library/animals.txt through a pipe (| tr a-z A-Z).", cmd:"cat library/animals.txt | tr a-z A-Z", check:{typed:["animals.txt","|","tr"]}},
        {id:"flow.check.3", ask:"Sort, uniq and count library/scores.txt in one long pipe.", cmd:"cat library/scores.txt | sort | uniq | wc", check:{typed:["sort","uniq","wc"]}}
      ]}
    ]},

    /* ---------------- Level 10 — variables ---------------- */
    {id:"vars", word:"POWER", title:"Tower of Names", lessons:[
      {id:"vars.set", title:"make a variable", letters:[0], tasks:[
        {id:"vars.set.1", show:"Save a word in a box called a variable. Type <b>pet=dragon</b> (no spaces around =)", cmd:"pet=dragon", check:{setVar:"pet"}},
        {id:"vars.set.2", show:"Show what is inside the box. Type <b>echo $pet</b> — the $ means \"what's inside\"", cmd:"echo $pet", check:{typed:["echo","$pet"]}},
        {id:"vars.set.3", ask:"Make a variable called hero with any name: hero=...", cmd:"hero=greppo", check:{setVar:"hero"}}
      ]},
      {id:"vars.use", title:"use a variable in a sentence", letters:[1], tasks:[
        {id:"vars.use.1", show:"Variables work anywhere. Type <b>echo my pet is $pet</b>", cmd:"echo my pet is $pet", check:{typed:["$pet"]}},
        {id:"vars.use.2", ask:"Show your hero variable: echo $hero", cmd:"echo $hero", check:{typed:["$hero"]}}
      ]},
      {id:"vars.who", title:"$USER, whoami, date", letters:[2], tasks:[
        {id:"vars.who.1", show:"The computer already knows you. Type <b>whoami</b>", cmd:"whoami", check:{ran:"whoami"}},
        {id:"vars.who.2", show:"Your name is in a ready-made variable. Type <b>echo $USER</b>", cmd:"echo $USER", check:{typed:["$USER"]}},
        {id:"vars.who.3", ask:"What day is it? Type the date command.", cmd:"date", check:{ran:"date"}}
      ]},
      {id:"vars.mix", title:"Mix — your own variables", letters:[3], tasks:[
        {id:"vars.mix.1", ask:"Make a variable color with your favorite color: color=...", cmd:"color=blue", check:{setVar:"color"}},
        {id:"vars.mix.2", ask:"Show it: echo $color", cmd:"echo $color", check:{typed:["$color"]}},
        {id:"vars.mix.3", ask:"Show a calendar.", cmd:"cal", check:{ran:"cal"}}
      ]},
      {id:"vars.check", title:"Final Checkpoint", checkpoint:true, letters:[4], tasks:[
        {id:"vars.check.1", ask:"Print your name with whoami.", cmd:"whoami", check:{ran:"whoami"}},
        {id:"vars.check.2", ask:"Make a variable star with any word: star=...", cmd:"star=shine", check:{setVar:"star"}},
        {id:"vars.check.3", ask:"Show it: echo $star", cmd:"echo $star", check:{typed:["$star"]}},
        {id:"vars.check.4", ask:"Show your name variable: echo $USER", cmd:"echo $USER", check:{typed:["$USER"]}},
        {id:"vars.check.5", ask:"Open the treasure: read ~/treasure.txt.", cmd:"cat ~/treasure.txt", check:{cat:"~/treasure.txt"}}
      ]}
    ]}
  ]
};
