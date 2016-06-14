_isMentioningCardicraft = function (message) {
  return message.text.toLowerCase().indexOf("!cc") == 0;
};

_replyCardicraft = function (message) {
  //la commande commence par !cc
  var self = this;
  var channel = self._getChannelOrUser(message);
  var ID = message.user;
  this._MajCardior(Math.trunc(message.ts));//on fait une affectation pour attendre le résultat de la fonction
  var resString = "";
  if (channel.name == "random" || channel.name == "general" || channel.name == "clope" || channel.name == "evol-du-futur" || channel.name == "tech"){
    self.postTo(channel.name, "Tu devrais plutot essayer dans un message privé à Cardibot ....", {as_user: true});
  }else if (self._isMentioningSommaireCardicraft(message)){
    self._replySommaireCardicraft(message);
  } else if (self._isMentioningStartCardicraft(message)){
    self._replyStartCardicraft(message);
  } else if (self._isMentioningInfosCardicraft(message)){
    self._replyInfosCardicraft(message);
  } else if (self._isMentioningCoutsCardicraft(message)) {
    self._replyCoutsCardicraft(message);
  } else if (self._isMentioningAchatmineCardicraft(message)) {
    self._replyAchatmineCardicraft(message);
  } else if (self._isMentioningAchatcaserneCardicraft(message)) {
    self._replyAchatcaserneCardicraft(message);
  } else if (self._isMentioningTrainCardicraft(message)) {
    self._replyTrainCardicraft(message);
  } else if (self._isMentioningCibleCardicraft(message)) {
    self._replyCibleCardicraft(message);
  } else if (self._isMentioningAttackCardicraft(message)) {
    self._replyAttackCardicraft(message);
  } else {
    self._replySommaireCardicraft(message);
  }
};

_isMentioningSommaireCardicraft = function (message){
  return (message.text.toLowerCase().indexOf("sommaire") == 4);
};

_replySommaireCardicraft = function (message) {
  var self = this;
  var channel = self._getChannelOrUser(message);
  var resString = "";
  resString += "--------------------Sommaire de CARDICRAFT---------------------\n";
  resString += "Commandes disponibles :\n";
  resString += "!cc start : commande activable une seule fois pour commencer une partie\n";
  resString += "!cc sommaire : voir le sommaire du jeu\n";
  resString += "!cc infos : connaitre son nombre de CardiOr et le cout d'amélioration\n";
  resString += "!cc couts : savoir combien coute la prochaine amélioration des batiment\n";
  resString += "!cc achat mine : acheter le niveau de mine de CardiOr supérieur\n";
  resString += "!cc achat caserne : acheter le niveau de caserne supérieur (améliorer vos CardiBarbares)\n";
  resString += "!cc train X : entrainez X CardiBarbares au même niveau que votre caserne\n";
  resString += "!cc cible : récupérer la liste des cible possible pour une attaque (liste des joueurs)\n";
  resString += "!cc attack X Y : attaquer le joueur X (donner le meme nom que celui qui apparait dans les cibles) avec Y CardiBarbares\n";
  resString += "-----------------------------------------------------------------------\n";
  self.postTo(channel.name, resString, {as_user: true});
};

_isMentioningStartCardicraft=function(message){
  return (message.text.toLowerCase().indexOf("start") == 4);
};

//pour démarrer une session cardicraft
_replyStartCardicraft=function(message){
  var self = this;
  var channel = self._getChannelOrUser(message);
  var ID = message.user;
  var resString = "";
  self.db.query("SELECT id FROM cardicraft WHERE id = $1", [ID], function(err, result) {
    if (result.rows.length==0){
      self.db.query("INSERT INTO cardicraft (id, nom, ressource, niveaubat, niveauunit, timest) VALUES($1, $2, $3, $4, $5, $6)", [ID, channel.name, 0, 0, 0, Math.trunc(message.ts)]);
      self.db.query("UPDATE cardicraft SET niveaubat=1, niveauunit=1 WHERE id = $1",[ID]);
      resString += "Tu viens de commencer ta partie de CardiCraft !\n";
      resString += "N'hésites pas à utiliser la commande '!cc sommaire' pour connaitre toutes les commandes.";
      self.postTo(channel.name, resString, {as_user: true});
    }else{
      resString += "Tu as déjà une partie en cours.\n";
      resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
      self.postTo(channel.name, resString, {as_user: true});
    }
  });
};

_isMentioningInfosCardicraft=function(message){
  return (message.text.toLowerCase().indexOf("infos") == 4);
};

//demande d'info sur la session de cardicraft
_replyInfosCardicraft=function(message) {
  var self = this;
  var channel = self._getChannelOrUser(message);
  var ID = message.user;
  var resString = "";
  self.db.query("SELECT nom, ressource, niveaubat, niveauunit, nbunit FROM cardicraft WHERE id = $1", [ID], function(err, result) {
    if (result.rows.length==1){
      resString += result.rows[0].nom + "\n";
      resString += "Ton Batiment de production de CardiOr est niveau " + result.rows[0].niveaubat + "\n";
      resString += "Ta caserne est niveau " + result.rows[0].niveauunit + "\n";
      resString += "Tu possèdes " + result.rows[0].ressource + " CardiOr\n";
      resString += "Tu possèdes " + result.rows[0].nbunit + " CardiBarbares\n";
      self.postTo(channel.name, resString, {as_user: true});
    }else{
      resString += "Tu devrais d'abord lancer ta partie.\n";
      resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
      self.postTo(channel.name, resString, {as_user: true});
    }
  });
};

_isMentioningCoutsCardicraft=function(message){
  return message.text.toLowerCase().indexOf("couts") == 4;
};

//demande du cout du niveau supérieur des batiments
_replyCoutsCardicraft=function(message) {
  var self = this;
  var channel = self._getChannelOrUser(message);
  var ID = message.user;
  var resString = "";
  self.db.query("SELECT nom, ressource, niveaubat, niveauunit FROM cardicraft WHERE id = $1", [ID], function(err, result) {
    if (result.rows.length==1){
      resString += result.rows[0].nom + "\n";
      resString += "Ta mine de CardiOr est niveau " + result.rows[0].niveaubat + "\n";
      var level_mine = parseInt(result.rows[0].niveaubat)+1;
      var resCoutMine = self._CoutMine(level_mine);
      resString += "Pour l'améliorer tu vas devoir débourser " + resCoutMine + " CardiOr\n";
      resString += "Ta caserne est niveau " + result.rows[0].niveauunit + "\n";
      var level_caserne = parseInt(result.rows[0].niveauunit)+1;
      var resCoutCaserne = self._CoutCaserne(level_caserne);
      resString += "Pour l'améliorer tu vas devoir débourser " + resCoutCaserne + " CardiOr\n";
      resString += "Chaque CardiBarbare coute 15 CardiOr\n";
      self.postTo(channel.name, resString, {as_user: true});
    }else{
      resString += "Tu devrais d'abord lancer ta partie.\n";
      resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
      self.postTo(channel.name, resString, {as_user: true});
    }
  });
};

_isMentioningAchatmineCardicraft=function(message){
  return (message.text.toLowerCase().indexOf("achat mine") == 4);
};

//Achat du niveau supérieur de mine de Cardior
_replyAchatmineCardicraft=function(message) {
  var self = this;
  var channel = self._getChannelOrUser(message);
  var ID = message.user;
  var resString = "";
  self.db.query("SELECT nom, ressource, niveaubat FROM cardicraft WHERE id = $1", [ID], function(err, result) {
    if (result.rows.length==1){
      var level = parseInt(result.rows[0].niveaubat)+1;
      var resCout = self._CoutMine(level);
      if (result.rows[0].ressource>=resCout){
        //il peut acheter
        self.db.query("UPDATE cardicraft SET ressource = $1, niveaubat = $2 WHERE id = $3", [result.rows[0].ressource-resCout, level, ID]);
        resString += "Tu as bien acheté la mine de CardiOr de niveau " + level +"\n";
        resString += "Bon courage pour la suite !\n";
        self.postTo(channel.name, resString, {as_user: true});
      }else{//il peut pas acheter
        resString += "T'es trop pauvre mon vieux revient avec un plus gros pactole !\n";
        resString += "il te manque "+(resCout-result.rows[0].ressource)+" CardiOr LOL\n";
        self.postTo(channel.name, resString, {as_user: true});
      }
    }else{
      resString += "Tu devrais d'abord lancer ta partie.\n";
      resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
      self.postTo(channel.name, resString, {as_user: true});
    }
  });
};

_isMentioningAchatcaserneCardicraft=function(message){
  return (message.text.toLowerCase().indexOf("achat caserne") == 4);
};

//Achat du niveau supérieur de caserne
_replyAchatcaserneCardicraft=function(message) {
  var self = this;
  var channel = self._getChannelOrUser(message);
  var ID = message.user;
  var resString = "";
  self.db.query("SELECT nom, ressource, niveauunit FROM cardicraft WHERE id = $1", [ID], function(err, result) {
    if (result.rows.length==1){
      var level = parseInt(result.rows[0].niveauunit)+1;
      var resCout = self._CoutCaserne(level);
      if (result.rows[0].ressource>=resCout){
        //il peut acheter
        self.db.query("UPDATE cardicraft SET ressource = $1, niveauunit = $2 WHERE id = $3", [result.rows[0].ressource-resCout, level, ID]);
        resString += "Tu as bien acheté la caserne de niveau " + level +"\n";
        resString += "Bon courage pour la suite !\n";
        self.postTo(channel.name, resString, {as_user: true});
      }else{//il peut pas acheter
        resString += "T'es trop pauvre mon vieux revient avec un plus gros pactole !\n";
        resString += "il te manque "+(resCout-result.rows[0].ressource)+" CardiOr LOL\n";
        self.postTo(channel.name, resString, {as_user: true});
      }
    }else{
      resString += "Tu devrais d'abord lancer ta partie.\n";
      resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
      self.postTo(channel.name, resString, {as_user: true});
    }
  });
};

_isMentioningTrainCardicraft = function (message){
  return (message.text.toLowerCase().indexOf("train") == 4 && //commande train
  message.text.toLowerCase().split(" ").length==3 && //on vérifie qu'il y a 3 parties
  message.text.toLowerCase().split(" ")[2] == parseInt(message.text.toLowerCase().split(" ")[2],10)); //et que la 3eme est un entier
};

//demande d'info sur la session de cardicraft
_replyTrainCardicraft=function(message) {
  var self = this;
  var channel = self._getChannelOrUser(message);
  var ID = message.user;
  var resString = "";
  self.db.query("SELECT nom, ressource, nbunit FROM cardicraft WHERE id = $1", [ID], function (err, result) {
    if (result.rows.length==1){
      var training = parseInt(message.text.toLowerCase().split(" ")[2]);
      if (result.rows[0].ressource>=training*15){
        //il peut acheter
        self.db.query("UPDATE cardicraft SET ressource = $1, nbunit = $2 WHERE id = $3", [result.rows[0].ressource-(training*15), result.rows[0].nbunit+training, ID]);
        resString += "Tu as bien acheté " + training +" CardiBarbares.\n";
        resString += "Bon courage pour la suite !\n";
        self.postTo(channel.name, resString, {as_user: true});
      }else{//il peut pas acheter
        resString += "T'es trop pauvre mon vieux revient avec un plus gros pactole !\n";
        resString += "il te manque "+((training*15)-result.rows[0].ressource)+" CardiOr LOL\n";
        self.postTo(channel.name, resString, {as_user: true});
      }
    }else{
      resString += "Tu devrais d'abord lancer ta partie.\n";
      resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
      self.postTo(channel.name, resString, {as_user: true});
    }
  });
};


_isMentioningCibleCardicraft=function(message){
  return message.text.toLowerCase().indexOf("cible") == 4;
};

//demande des cibles potentielles
_replyCibleCardicraft=function(message) {
  var self = this;
  var channel = self._getChannelOrUser(message);
  var ID = message.user;
  var resString = "";
  self.db.query("SELECT nom FROM cardicraft", function (err, result) {
    resString+="Cibles potentielles : \n"
    for (var i = 0;i<result.rows.length;i++){
      resString += "- "+result.rows[i].nom+"\n";
    }
    self.postTo(channel.name, resString, {as_user: true});
  });
}

_isMentioningAttackCardicraft = function (message){
  return (message.text.toLowerCase().indexOf("attack") == 4 && //commande train
  message.text.toLowerCase().split(" ").length==4 && //on vérifie qu'il y a 3 parties
  message.text.toLowerCase().split(" ")[3] == parseInt(message.text.toLowerCase().split(" ")[3],10)); //et que la 4eme est un entier
};

//demande d'attaque sur un joueur
_replyAttackCardicraft=function(message) {
  var self = this;
  var channel = self._getChannelOrUser(message);
  var ID = message.user;
  var resString_att = "";
  var resString_def = "";
  var resString = "";
  var def = message.text.toLowerCase().split(" ")[2];
  var nb_attack = parseInt(message.text.toLowerCase().split(" ")[3]);
  console.error("le nombre d'attaquants !!! "+nb_attack);
  self.db.query("SELECT nom, nbunit, niveauunit, ressource FROM cardicraft WHERE id = $1", [ID], function (err, result) {
    if (result.rows.length!=1){//l'attaquant n'existe pas
      resString += "Tu devrais d'abord lancer ta partie.\n";
      resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
      self.postTo(channel.name, resString, {as_user: true});
    }else if (nb_attack>result.rows[0].nbunit){//l'attaquant n'a pas assez d'unités
      resString += "Tu essayes de me baiser ?\n";
      resString += "T'as pas assez de CardiBarbares espèce de faible.\n";
      resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
      self.postTo(channel.name, resString, {as_user: true});
    }else{//On est ok pour l'attaquant on va checker le défenseur
      console.log("TIENS SACHA 1 : "+nb_attack+" et "+result.rows[0].nbunit);
      self.db.query("SELECT nbunit, niveauunit, ressource, nom FROM cardicraft WHERE nom = $1", [def], function (err2, result2) {
        if (result2.rows.length!=1){//le défenseur n'existe pas
          resString += "Tu veux attaquer quelqu'un qui n'existe pas ...\n";
          resString += "T'es complétement débile ou ça se passe comment ?\n";
          resString += "Plus d'informations avec la commande '!cc sommaire'.\n";
          self.postTo(channel.name, resString, {as_user: true});
        }else{//le def existe donc c'est bon (c'est la seule condition min pour le def)
          //on va calculer le ratio random de l'attaquant
          var aleat=Math.floor(Math.random() * (11 + 10)) -10;
          var coef_Attack = (aleat/100) +1;
          var force_attack = (1+((result.rows[0].niveauunit-1)*0.3))*nb_attack*coef_Attack;
          var force_def = (1.2+((result2.rows[0].niveauunit-1)*0.3))*result2.rows[0].nbunit;
          var res = force_attack - force_def;
          if (res>0){//l'attaquant win
            var restant_att = Math.round((res/force_attack)*nb_attack);//nombre de soldats restants à l'attaque
            var restant_def = 0;
            var gains = restant_att * 20;//pillage
            if (gains>result2.rows[0].ressource){//si l'attaquant gagne trop il gagne tout.
              gains=result2.rows[0].ressource;
            }
            resString_att += "Tu as gagné ! Tu reviens avec " + restant_att + " CardiBarbares et "+gains+" CardiOr. Bravo";
            resString_def += "Tu t'es fait attaqué par " + result.rows[0].nom + " et tu as perdu. Tes défenses se sont faites décimer et tu t'es fait voler "+gains+" CardiOr.";
          }else{//le défenseur win
            var restant_def = Math.round(-(res/force_def)*result2.rows[0].nbunit);//nombre de soldats restants à la défense
            var restant_att = 0;
            var gains = 0;
            resString_att += "Tu as perdu ! Tes troupes se sont faites décimer et tu rentres brocouille. Bravo, c'était bien malin de s'attaquer a plus fort que toi.";
            resString_def += "Tu t'es fait attaqué par " + result.rows[0].nom + " et tu as gagné. Il te reste maintenant "+restant_def+" CardiBarbares mais tu as gardé tout ton CardiOr.";
          }
          //update attaquant
          self.db.query("UPDATE cardicraft SET nbunit = $1, ressource = $2 WHERE id = $3", [restant_att, result.rows[0].ressource+gains, ID]);
          self.postTo(result.rows[0].nom, resString_att, {as_user: true});
          //update défenseur
          self.db.query("UPDATE cardicraft SET ressource = $1, nbunit = $2 WHERE nom = $3", [result2.rows[0].ressource-(gains), restant_def, result2.rows[0].nom]);
          self.postTo(result2.rows[0].nom, resString_def, {as_user: true});
          //on modifie les unités
        }
      });
    }
  });
}

//réponse pour une fonction pas encore implémentée
_replyNotImplementedYet = function (message){
  var self = this;
  var channel = self._getChannelOrUser(message);
  var ID = message.user;
  var resString = "";
  resString += "Cette fonctionnalité n'est pas encore implémentée.\nSi vous voulez accélerez la cadence donnez de l'argent aux dévellopeurs bandes de chacals c'est pas un free to play ici.";
  self.postTo(channel.name, resString, {as_user: true});
};

_CoutMine = function(level){
  var res;
  if (level<11){
    res = 4;
    for (var i= 1;i<level;i++){
      res = (res * 2)+2;
    }
  }
  else{
    res = 3070;
    for (var i= 10;i<level;i++){
      res = res * 1.4;
    }
  }
  return Math.trunc(res);
};

_CoutCaserne = function(level){
  var res=270;
  for (var i= 1;i<level;i++){
    res = (res * 1.8);
  }
  return Math.trunc(res);
};

_MajCardior = function(timestamp2){
  var self = this;
  self.db.query("SELECT nom, ressource, niveaubat, timest FROM cardicraft", function(err, result) {
    for (var j =0;j < result.rows.length;j++) {
      if (err == null && result.rows[j] != undefined) {
        var prod = 1; // production par minute au niveau 1
        var coef;
        for (var i = 1, tot = result.rows[j].niveaubat; i < tot; i++) {
          coef = 1.05 + (1 / i);
          prod = coef * prod;
        }
        var deltaT = timestamp2 - result.rows[j].timest;
        var res = Math.trunc(parseInt(result.rows[j].ressource) + parseInt((deltaT / 60) * prod));
        if (res != 0) {
          self.db.query("UPDATE cardicraft SET ressource = $1, timest = $2 WHERE nom = $3", [res, timestamp2, result.rows[j].nom]);
        }
      }
    }
  });
};

// TODO: Rajouter un système de temps pour les améliorations de batiments
// TODO: Rajouter une amélioration d'unité