/* =========================================================
   NOCHE DE REYES
   ENTRENADOR DE TEXTO · ORSINO
   ========================================================= */


/* =========================================================
   DATOS DEL PERSONAJE
   ========================================================= */

const orsinoLines = [

  // =======================================================
  // ACTO I · ESCENA I
  // =======================================================

  {
    id: 1,
    act: "ACTO I",
    scene: "ESCENA I",
    cueCharacter: "INICIO DE ESCENA",
    cue: "Entran el Duque Orsino, Valentino y los músicos.",
    text: "Si la música alimenta al amor, seguid cantando. Atiborradme, y así, con el exceso, el apetito quizás enferme y muera. ¡Tócala otra vez!"
  },

  {
    id: 2,
    act: "ACTO I",
    scene: "ESCENA I",
    cueCharacter: "MÚSICOS",
    cue: "Aunque sea a contratiempo, sueña, ríe, vive y ama.",
    text: "¡Basta! No es tan dulce como lo era. ¡Espíritu de amor! ¡Cuánta hambre tienes! Quien en ti se sumerge, por mucho que se precie, en un instante cae en el desprecio. Adoptas tantas formas que nada hay tan fantástico."
  },

  {
    id: 3,
    act: "ACTO I",
    scene: "ESCENA I",
    cueCharacter: "CURIO",
    cue: "¿Comienza la caza, señor?",
    text: "¿De qué?"
  },

  {
    id: 4,
    act: "ACTO I",
    scene: "ESCENA I",
    cueCharacter: "CURIO",
    cue: "Del oso.",
    text: "Oso, yo, ser el cazado. Al posar mis ojos sobre Olivia por vez primera, ¡creí que ella limpiaba el aire de toda peste! Pero aquel instante osado me convirtió en un oso acosado desde entonces por mi deseo, el más cruel perro de caza que persigue a mi alma. ¿Alguna noticia?"
  },

  {
    id: 5,
    act: "ACTO I",
    scene: "ESCENA I",
    cueCharacter: "CURIO",
    cue: "Como una monja, con la cara cubierta, regará su alcoba con lágrimas una vez al día para honrar el amor de su hermano muerto.",
    text: "Ay, si el corazón de tan sublime ser paga así la deuda de amor a un hermano, ¿cómo amará cuando su cerebro, su alma y también su corazón sean saciados por un mismo rey? Yacen ante Orsino, en un lecho de flores, pensamientos de amor bordados en colores."
  },


  // =======================================================
  // ACTO I · ESCENA IV
  // =======================================================

  {
    id: 6,
    act: "ACTO I",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "O teméis por su constancia o por mi aptitud. Si dudáis que esto pueda ir a más…",
    text: "¿Cesáreo? ¿Cesáreo?"
  },

  {
    id: 7,
    act: "ACTO I",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "A vuestro servicio, Señor…",
    text: "Cesáreo, de mí sabes ni más ni menos que todo; te he abierto el libro de mi alma secreta. Así que dirígete a casa de Olivia, que no te nieguen la entrada, preséntate ante su puerta y diles que allí te plantarás hasta que te den audiencia."
  },

  {
    id: 8,
    act: "ACTO I",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "Seguro, mi señor, que si está tan abandonada a su lamento como se dice, no me recibirá.",
    text: "Pues entonces te saltas todas las barreras de la cortesía antes que volverte de vacío."
  },

  {
    id: 9,
    act: "ACTO I",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "Y si consigo hablar con ella… ¿qué?",
    text: "Despliega la pasión de mi amor, cautívala hablando de mi devoción, representa ante ella mi congoja. Prestará más atención a tu juventud que a un mensajero más maduro."
  },

  {
    id: 10,
    act: "ACTO I",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "No lo creo, mi señor. ¿Señor?",
    text: "Pues créetelo, buen mozo. Quien diga que ya eres un hombre no se ha fijado bien en tu edad. Tus labios son tan suaves y rojizos como los de la diosa Diana; tu aflautada voz, como el órgano de una joven, agudo y claro; y el resto también tiene una apariencia femenina. Las estrellas nos son propicias. Acompañadle. Id todos con él. Si tienes éxito, vivirás tan libre como tu señor, haciendo uso de su fortuna."
  },


  // =======================================================
  // ACTO II · ESCENA IV
  // =======================================================

  {
    id: 11,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "INICIO DE ESCENA",
    cue: "El séquito canta hasta que entra Orsino y les hace callar.",
    text: "Cantad esa canción antigua que oí anoche. Alivió mi pasión mucho más que estas tonadillas ligeras y letras repetitivas que se llevan en estos tiempos tan acelerados y cambiantes. Aunque sea un sólo verso, vamos, cantadla."
  },

  {
    id: 12,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VALENTINA",
    cue: "No está por aquí ahora quien debiera interpretar esa canción.",
    text: "¿Quién era?"
  },

  {
    id: 13,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "CURIO",
    cue: "¡Es tan resbaladizo como un sapo enjabonado!",
    text: "Buscadle, y mientras tanto cantad algo que me entretenga… Ven, chaval. Si alguna vez amas, recuérdame entre tanto dolor agridulce. Tal y como estoy yo ahora están todos los amantes sinceros, variables en todo salvo en la imagen constante de la criatura a la que aman. ¿Te gusta la música?"
  },

  {
    id: 14,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "Es el eco del trono donde se asienta el amor.",
    text: "Eso ha estado bien… Me jugaría la vida a que, pese a lo joven que eres, ya te has quedado prendado alguna vez. ¿A que sí?"
  },

  {
    id: 15,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "¿Prendéis vos el fuego, señor?",
    text: "¿Y cómo es ella?"
  },

  {
    id: 16,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "Tiene una tez como la vuestra.",
    text: "Seguro que no te merece. ¿De qué edad?"
  },

  {
    id: 17,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "Como la vuestra.",
    text: "¡Qué vieja, por Dios! ¡Que se busque ella a alguien mayor! Chico, por muy elevado concepto que tengamos los hombres de nosotros mismos, mareamos la perdiz a cada momento, hoy nos gusta una y mañana otra."
  },

  {
    id: 18,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "¡Así es, mi señor!",
    text: "Que te quiera alguien más joven, o tu amor no se mantendrá firme. Las mujeres son como las rosas, muy florecientes, pero a la hora están caídas."
  },

  {
    id: 19,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "¡Qué cierto es! ¡Así lo son! Muere su belleza tras llegar la perfección.",
    text: "¡Hombre, ven! ¡La canción de anoche! ¡Escucha, Cesáreo! Es antigua y sencilla. La cantan las costureras y vestidoras de santos. Dice verdades como templos, y se regodea en la inocencia del amor, como en la edad clásica."
  },

  {
    id: 20,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "BUFÓN",
    cue: "¿Listo, señor?",
    text: "Adelante."
  },

  {
    id: 21,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "BUFÓN",
    cue: "Y cuando me hice viejo, hacía viento y llovía, yo seguía bebiendo, casi todos los días.",
    text: "Esto por las molestias."
  },

  {
    id: 22,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "BUFÓN",
    cue: "No es molestia señor, cantar es un placer.",
    text: "Pues pago por vuestro placer."
  },

  {
    id: 23,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "BUFÓN",
    cue: "Por todo placer se paga, tarde o temprano.",
    text: "Me place que os vayáis…"
  },

  {
    id: 24,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "BUFÓN",
    cue: "¡Adiós!",
    text: "Podéis retiraros. Una vez más, Cesáreo, dirígete a esa soberana crueldad, y dile que mi amor, más noble que el mundo entero, no le da valor a sus posesiones. Que las propiedades que le han legado me resultan inapreciables, por fortuna. Son sus preciosas cualidades naturales las que anhelo poseer."
  },

  {
    id: 25,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "¿Y si ella no puede amaros, señor?",
    text: "No puedo aceptar tal respuesta."
  },

  {
    id: 26,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "¿No debería ella aceptar tal respuesta?",
    text: "No hay corazón de mujer tan grande para aguantar tanto. Son glotonas del amor, pero no les va al corazón, sino al paladar; se lo comen, se lo tragan y lo vomitan. Pero mi capacidad de amar es oceánica, todo lo puede abarcar. No compares el amor que una mujer puede darme con el que yo siento por Olivia."
  },

  {
    id: 27,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "Pero yo conozco...",
    text: "¿Qué conoces?"
  },

  {
    id: 28,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "Mi padre tuvo una hija que amó a un hombre tanto como, quizás, si yo fuera mujer, os amaría.",
    text: "Cuéntame su historia."
  },

  {
    id: 29,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "Pero no en el corazón, que es donde de verdad habla el amor.",
    text: "¿Pero murió tu hermana de amor?"
  },

  {
    id: 30,
    act: "ACTO II",
    scene: "ESCENA IV",
    cueCharacter: "VIOLA",
    cue: "¿Marcho a ver a la señora?",
    text: "Esa es tu tarea."
  },


  // =======================================================
  // ACTO V · ESCENA I
  // =======================================================

  {
    id: 31,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "INICIO DE ESCENA",
    cue: "Entran Orsino y Viola a la puerta de casa de Olivia, donde está el Bufón.",
    text: "Nos volvemos a ver… Tú sirves a Doña Olivia. ¿Cómo te va?"
  },

  {
    id: 32,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "BUFÓN",
    cue: "Mejor con mis enemigos que con mis amigos.",
    text: "Será al revés. Mejor con tus amigos."
  },

  {
    id: 33,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "BUFÓN",
    cue: "No señor, peor.",
    text: "¿Cómo puede ser?"
  },

  {
    id: 34,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "BUFÓN",
    cue: "Así que me conozco mejor gracias a mis enemigos, porque mis amigos me engañan.",
    text: "Eres realmente bueno."
  },

  {
    id: 35,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "BUFÓN",
    cue: "No, señor, aunque queráis ser uno de mis amigos.",
    text: "Por mí no te irá peor. Toma una moneda."
  },

  {
    id: 36,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "BUFÓN",
    cue: "Pero lo que digo tiene doble sentido, así que habría que doblarlo todo.",
    text: "Está mal doblar las cosas, porque se pueden romper."
  },

  {
    id: 37,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "BUFÓN",
    cue: "Dejaos llevar por la carne...",
    text: "Pecaré. Ahí va otra."
  },

  {
    id: 38,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "BUFÓN",
    cue: "Ya puestos, no hay dos sin tres…",
    text: "Por ahora tu ingenio no me sacará más dinero. Así que hazle saber a tu señora que quiero hablar con ella, y si la traes aquí, puede que aumente el botín."
  },

  {
    id: 39,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "VIOLA",
    cue: "Ese es el hombre que me rescató.",
    text: "Esa cara la recuerdo bien, pero cuando la vi por última vez estaba tiznada de negro. Era el capitán de un barquichuelo que se enfrentó con tal fiereza contra nuestra noble flota que fue elogiado hasta por aquellos a quienes derrotó. ¿Qué sucede?"
  },

  {
    id: 40,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "VIOLA",
    cue: "Me defendió, señor, pero para mí que no anda bien de la azotea: me decía unas cosas demasiado raras.",
    text: "Notable pirata, ladrón de agua salada, ¿qué estúpido atrevimiento te ha puesto ahora en manos de aquellos a los que robaste y asesinaste?"
  },

  {
    id: 41,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "VIOLA",
    cue: "¿Cómo puede ser esto?",
    text: "¿Cuándo llegó a la ciudad?"
  },

  {
    id: 42,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "ANTONIO",
    cue: "Hoy, tras pasar tres meses junto a mí, día y noche, sin separarnos un solo minuto.",
    text: "Aquí viene la condesa, el cielo pisa la tierra. En cuanto a ti, tus palabras son de loco: tres meses lleva este joven a mis órdenes. Seguiremos hablando después. Apartaos."
  },

  {
    id: 43,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "VIOLA",
    cue: "Señora...",
    text: "Dulce Olivia..."
  },

  {
    id: 44,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "OLIVIA",
    cue: "¿Ya estamos con la misma cantinela? Me resulta tan burda y empachosa al oído como un aullido tras una canción.",
    text: "¿Aún tan cruel?"
  },

  {
    id: 45,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "OLIVIA",
    cue: "Aún tan constante, señor.",
    text: "¿Constante en vuestra perversidad? Malcriada señora, ¿qué puedo hacer?"
  },

  {
    id: 46,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "OLIVIA",
    cue: "Lo que le venga bien hacer al señor.",
    text: "Escuchadme. Ya que desdeñáis mi amor, seguid viviendo así de déspota, si os hace feliz. Pero a este siervo carnal, que sé que amáis, y a quien yo tengo en gran estima, se lo arrebato a vuestros crueles ojos. Salgamos de aquí."
  },

  {
    id: 47,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "OLIVIA",
    cue: "Llamad al Santo Padre.",
    text: "¡Nos marchamos de aquí!"
  },

  {
    id: 48,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "OLIVIA",
    cue: "¿A dónde, Cesáreo? ¿Huyes, esposo, así?",
    text: "¿Esposo?"
  },

  {
    id: 49,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "OLIVIA",
    cue: "Sí, esposo. No lo puede negar.",
    text: "¿Tú eres su esposo?"
  },

  {
    id: 50,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "CURA",
    cue: "Desde aquel momento, mi reloj me dice que he avanzado dos horas hacia mi tumba.",
    text: "¡Querubín traicionero! ¿Qué va a ser de ti cuando el tiempo te siembre todo el pelo de gris?"
  },

  {
    id: 51,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "ANDRÉS AGUADO",
    cue: "Un asistente del duque, un tal Cesáreo. Le tomábamos por cobarde, pero es la encarnación del diablo.",
    text: "¿Mi caballero Cesáreo?"
  },

  {
    id: 52,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "ANDRÉS AGUADO",
    cue: "Y aquí viene Tobías cojeando.",
    text: "¿Cómo estáis, caballero?"
  },

  {
    id: 53,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "SEBASTIÁN",
    cue: "Perdonadme, amor, aunque sólo sea por los votos que nos acabamos de jurar.",
    text: "Una cara, una voz, un atuendo y dos personas. ¡Un espejismo natural, que es y no es!"
  },

  {
    id: 54,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "VIOLA",
    cue: "Todo lo que me ha sucedido desde entonces ha tenido que ver con mi relación con esta dama y este señor.",
    text: "No os sorprendáis; bien noble es su sangre. Si todo es como la imagen que se refleja, quiero formar parte de este feliz naufragio. Mil veces me has dicho que jamás querrías a una mujer como a mí."
  },

  {
    id: 55,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "VIOLA",
    cue: "Y lo jurado sigue tan cierto en mi alma como el fuego que alimenta al sol para separar el día de la noche.",
    text: "Dame la mano. Esa ropa de mujer te sienta muy bien."
  },

  {
    id: 56,
    act: "ACTO V",
    scene: "ESCENA I",
    cueCharacter: "OLIVIA",
    cue: "Espero que os complazca tenerme como cuñada más que como esposa, y que mañana rubriquemos esa alianza.",
    text: "Acepto gustoso la oferta. Vuestro señor os libera, y por vuestro servicio prestado, contra la naturaleza de vuestro sexo y vuestra delicada crianza, y ya que me habéis llamado señor tanto tiempo, aquí tenéis mi mano, para que paséis a ser la señora de vuestro señor."
  }

];


/* =========================================================
   ESTADO
   ========================================================= */

let currentLineIndex = 0;
let rehearsalIndex = 0;
let currentSceneKey = "";

const STORAGE_KEY = "orsino-progress-v1";

let progress = loadProgress();


/* =========================================================
   ELEMENTOS
   ========================================================= */

const navButtons = document.querySelectorAll(".nav-button");
const views = document.querySelectorAll(".view");

const startLearningButton =
  document.getElementById("startLearningButton");

const modeCards =
  document.querySelectorAll("[data-open-view]");

const learnCurrentNumber =
  document.getElementById("learnCurrentNumber");

const learnTotalNumber =
  document.getElementById("learnTotalNumber");

const learnAct =
  document.getElementById("learnAct");

const learnScene =
  document.getElementById("learnScene");

const cueCharacter =
  document.getElementById("cueCharacter");

const cueText =
  document.getElementById("cueText");

const answerBox =
  document.getElementById("answerBox");

const answerText =
  document.getElementById("answerText");

const hintBox =
  document.getElementById("hintBox");

const hintText =
  document.getElementById("hintText");

const firstWordButton =
  document.getElementById("firstWordButton");

const hintButton =
  document.getElementById("hintButton");

const showAnswerButton =
  document.getElementById("showAnswerButton");

const evaluationButtons =
  document.getElementById("evaluationButtons");

const practiceAgainButton =
  document.getElementById("practiceAgainButton");

const rememberedButton =
  document.getElementById("rememberedButton");

const previousLineButton =
  document.getElementById("previousLineButton");

const nextLineButton =
  document.getElementById("nextLineButton");

const linesContainer =
  document.getElementById("linesContainer");

const lineSearch =
  document.getElementById("lineSearch");

const totalLinesStat =
  document.getElementById("totalLinesStat");

const masteredLinesStat =
  document.getElementById("masteredLinesStat");

const practiceLinesStat =
  document.getElementById("practiceLinesStat");

const progressPercentStat =
  document.getElementById("progressPercentStat");

const mainProgressPercent =
  document.getElementById("mainProgressPercent");

const mainProgressBar =
  document.getElementById("mainProgressBar");

const homeProgressText =
  document.getElementById("homeProgressText");

const homeProgressBar =
  document.getElementById("homeProgressBar");

const homeProgressDescription =
  document.getElementById("homeProgressDescription");

const difficultLinesContainer =
  document.getElementById("difficultLinesContainer");

const sceneProgressContainer =
  document.getElementById("sceneProgressContainer");

const resetProgressButton =
  document.getElementById("resetProgressButton");

const sceneSelector =
  document.getElementById("sceneSelector");

const restartSceneButton =
  document.getElementById("restartSceneButton");

const rehearsalDialogue =
  document.getElementById("rehearsalDialogue");

const orsinoTurn =
  document.getElementById("orsinoTurn");

const revealRehearsalButton =
  document.getElementById("revealRehearsalButton");

const rehearsalAnswer =
  document.getElementById("rehearsalAnswer");

const rehearsalPreviousButton =
  document.getElementById("rehearsalPreviousButton");

const rehearsalNextButton =
  document.getElementById("rehearsalNextButton");


/* =========================================================
   NAVEGACIÓN
   ========================================================= */

function openView(viewName) {

  views.forEach(view => {
    view.classList.remove("active");
  });

  const target =
    document.getElementById(`view-${viewName}`);

  if (target) {
    target.classList.add("active");
  }

  navButtons.forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.view === viewName
    );

  });

  if (viewName === "learn") {
    renderLearningLine();
  }

  if (viewName === "lines") {
    renderAllLines();
  }

  if (viewName === "progress") {
    renderProgress();
  }

  if (viewName === "rehearse") {
    prepareRehearsal();
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


navButtons.forEach(button => {

  button.addEventListener("click", () => {
    openView(button.dataset.view);
  });

});


modeCards.forEach(card => {

  card.addEventListener("click", () => {
    openView(card.dataset.openView);
  });

});


startLearningButton.addEventListener(
  "click",
  () => openView("learn")
);


/* =========================================================
   APRENDER
   ========================================================= */

function renderLearningLine() {

  const line = orsinoLines[currentLineIndex];

  if (!line) return;

  learnCurrentNumber.textContent =
    currentLineIndex + 1;

  learnTotalNumber.textContent =
    orsinoLines.length;

  learnAct.textContent =
    line.act;

  learnScene.textContent =
    line.scene;

  cueCharacter.textContent =
    line.cueCharacter;

  cueText.textContent =
    line.cue;

  answerText.textContent =
    line.text;

  answerBox.classList.add("hidden");
  hintBox.classList.add("hidden");
  evaluationButtons.classList.add("hidden");

  hintText.textContent = "";

}


function getFirstWord(text) {

  const clean =
    text.replace(/^[¡¿“"'(\[]+/, "");

  return clean.split(/\s+/)[0] || "";

}


function createHint(text) {

  const words =
    text.split(/\s+/);

  return words
    .map((word, index) => {

      if (index < 3) {
        return word;
      }

      const firstLetter =
        word.replace(/^[¡¿“"'(\[]+/, "")
          .charAt(0);

      if (!firstLetter) {
        return word;
      }

      return `${firstLetter}…`;

    })
    .join(" ");

}


firstWordButton.addEventListener(
  "click",
  () => {

    const line =
      orsinoLines[currentLineIndex];

    hintText.textContent =
      `Primera palabra: ${getFirstWord(line.text)}`;

    hintBox.classList.remove("hidden");

  }
);


hintButton.addEventListener(
  "click",
  () => {

    const line =
      orsinoLines[currentLineIndex];

    hintText.textContent =
      createHint(line.text);

    hintBox.classList.remove("hidden");

  }
);


showAnswerButton.addEventListener(
  "click",
  () => {

    answerBox.classList.remove("hidden");
    evaluationButtons.classList.remove("hidden");

  }
);


rememberedButton.addEventListener(
  "click",
  () => {

    const line =
      orsinoLines[currentLineIndex];

    progress[line.id] = "mastered";

    saveProgress();

    moveNextLearningLine();

  }
);


practiceAgainButton.addEventListener(
  "click",
  () => {

    const line =
      orsinoLines[currentLineIndex];

    progress[line.id] = "practice";

    saveProgress();

    moveNextLearningLine();

  }
);


function moveNextLearningLine() {

  if (
    currentLineIndex <
    orsinoLines.length - 1
  ) {

    currentLineIndex++;

  } else {

    currentLineIndex = 0;

  }

  renderLearningLine();
  updateHomeProgress();

}


nextLineButton.addEventListener(
  "click",
  () => {

    if (
      currentLineIndex <
      orsinoLines.length - 1
    ) {

      currentLineIndex++;

    } else {

      currentLineIndex = 0;

    }

    renderLearningLine();

  }
);


previousLineButton.addEventListener(
  "click",
  () => {

    if (currentLineIndex > 0) {

      currentLineIndex--;

    } else {

      currentLineIndex =
        orsinoLines.length - 1;

    }

    renderLearningLine();

  }
);


/* =========================================================
   MIS PARLAMENTOS
   ========================================================= */

function renderAllLines(filter = "") {

  linesContainer.innerHTML = "";

  const search =
    filter.toLowerCase().trim();

  const filtered =
    orsinoLines.filter(line => {

      return (
        line.text.toLowerCase().includes(search) ||
        line.cue.toLowerCase().includes(search) ||
        line.act.toLowerCase().includes(search) ||
        line.scene.toLowerCase().includes(search)
      );

    });


  filtered.forEach(line => {

    const card =
      document.createElement("article");

    card.className =
      "line-card";

    const status =
      progress[line.id];

    let statusText =
      "Sin practicar";

    if (status === "mastered") {
      statusText = "✓ Dominado";
    }

    if (status === "practice") {
      statusText = "↻ Practicar";
    }


    card.innerHTML = `

      <div class="line-card-header">

        <span>
          ${line.act} · ${line.scene}
        </span>

        <span class="line-status">
          ${statusText}
        </span>

      </div>

      <p>${escapeHTML(line.text)}</p>

    `;


    card.addEventListener(
      "click",
      () => {

        currentLineIndex =
          orsinoLines.findIndex(
            item => item.id === line.id
          );

        openView("learn");

      }
    );


    linesContainer.appendChild(card);

  });


  if (!filtered.length) {

    linesContainer.innerHTML = `
      <article class="line-card">
        <p>
          No encontramos ningún parlamento
          con esa búsqueda.
        </p>
      </article>
    `;

  }

}


lineSearch.addEventListener(
  "input",
  event => {

    renderAllLines(
      event.target.value
    );

  }
);


/* =========================================================
   PROGRESO
   ========================================================= */

function calculateProgress() {

  const total =
    orsinoLines.length;

  const mastered =
    orsinoLines.filter(
      line =>
        progress[line.id] === "mastered"
    ).length;

  const practice =
    orsinoLines.filter(
      line =>
        progress[line.id] === "practice"
    ).length;

  const percent =
    total
      ? Math.round(
          (mastered / total) * 100
        )
      : 0;

  return {
    total,
    mastered,
    practice,
    percent
  };

}


function renderProgress() {

  const stats =
    calculateProgress();

  totalLinesStat.textContent =
    stats.total;

  masteredLinesStat.textContent =
    stats.mastered;

  practiceLinesStat.textContent =
    stats.practice;

  progressPercentStat.textContent =
    `${stats.percent}%`;

  mainProgressPercent.textContent =
    `${stats.percent}%`;

  mainProgressBar.style.width =
    `${stats.percent}%`;

  renderSceneProgress();
  renderDifficultLines();

}


function updateHomeProgress() {

  const stats =
    calculateProgress();

  homeProgressText.textContent =
    `${stats.percent}%`;

  homeProgressBar.style.width =
    `${stats.percent}%`;

  if (stats.mastered === 0) {

    homeProgressDescription.textContent =
      "Todavía no has dominado ningún parlamento.";

  } else if (
    stats.mastered === stats.total
  ) {

    homeProgressDescription.textContent =
      "¡Has marcado todos los parlamentos como dominados!";

  } else {

    homeProgressDescription.textContent =
      `${stats.mastered} de ${stats.total} parlamentos dominados.`;

  }

}


function renderSceneProgress() {

  sceneProgressContainer.innerHTML = "";

  const scenes = {};

  orsinoLines.forEach(line => {

    const key =
      `${line.act} · ${line.scene}`;

    if (!scenes[key]) {

      scenes[key] = {
        total: 0,
        mastered: 0
      };

    }

    scenes[key].total++;

    if (
      progress[line.id] === "mastered"
    ) {

      scenes[key].mastered++;

    }

  });


  Object.entries(scenes)
    .forEach(([scene, values]) => {

      const percent =
        Math.round(
          (
            values.mastered /
            values.total
          ) * 100
        );

      const row =
        document.createElement("div");

      row.className =
        "scene-progress-item";

      row.innerHTML = `

        <span>${scene}</span>

        <div class="progress-bar">

          <div
            class="progress-fill"
            style="width:${percent}%"
          ></div>

        </div>

        <strong>
          ${percent}%
        </strong>

      `;

      sceneProgressContainer
        .appendChild(row);

    });

}


function renderDifficultLines() {

  difficultLinesContainer.innerHTML = "";

  const difficult =
    orsinoLines.filter(
      line =>
        progress[line.id] === "practice"
    );


  if (!difficult.length) {

    difficultLinesContainer.innerHTML = `
      <p>
        Todavía no has marcado textos
        para reforzar.
      </p>
    `;

    return;

  }


  difficult.forEach(line => {

    const item =
      document.createElement("article");

    item.className =
      "line-card";

    item.innerHTML = `

      <div class="line-card-header">

        <span>
          ${line.act} · ${line.scene}
        </span>

        <span>
          ↻ PRACTICAR
        </span>

      </div>

      <p>
        ${escapeHTML(line.text)}
      </p>

    `;


    item.addEventListener(
      "click",
      () => {

        currentLineIndex =
          orsinoLines.findIndex(
            value =>
              value.id === line.id
          );

        openView("learn");

      }
    );


    difficultLinesContainer
      .appendChild(item);

  });

}


/* =========================================================
   ENSAYO
   ========================================================= */

function getSceneKeys() {

  return [
    ...new Set(
      orsinoLines.map(
        line =>
          `${line.act}|${line.scene}`
      )
    )
  ];

}


function populateSceneSelector() {

  sceneSelector.innerHTML = "";

  const scenes =
    getSceneKeys();

  scenes.forEach(key => {

    const [act, scene] =
      key.split("|");

    const option =
      document.createElement("option");

    option.value = key;

    option.textContent =
      `${act} · ${scene}`;

    sceneSelector.appendChild(option);

  });


  if (!currentSceneKey) {

    currentSceneKey =
      scenes[0] || "";

  }

  sceneSelector.value =
    currentSceneKey;

}


function getCurrentSceneLines() {

  return orsinoLines.filter(
    line =>
      `${line.act}|${line.scene}` ===
      currentSceneKey
  );

}


function prepareRehearsal() {

  populateSceneSelector();

  rehearsalIndex = 0;

  renderRehearsal();

}


function renderRehearsal() {

  const sceneLines =
    getCurrentSceneLines();

  rehearsalDialogue.innerHTML = "";

  rehearsalAnswer.classList.add(
    "hidden"
  );

  if (!sceneLines.length) {

    orsinoTurn.classList.add(
      "hidden"
    );

    return;

  }


  const current =
    sceneLines[rehearsalIndex];


  const cue =
    document.createElement("div");

  cue.className =
    "dialogue-line";

  cue.innerHTML = `

    <strong>
      ${escapeHTML(current.cueCharacter)}
    </strong>

    <p>
      ${escapeHTML(current.cue)}
    </p>

  `;

  rehearsalDialogue
    .appendChild(cue);


  orsinoTurn.classList.remove(
    "hidden"
  );

  rehearsalAnswer.textContent =
    current.text;


  rehearsalPreviousButton.disabled =
    rehearsalIndex === 0;


  rehearsalNextButton.textContent =
    rehearsalIndex ===
    sceneLines.length - 1
      ? "Terminar escena ✓"
      : "Continuar →";

}


sceneSelector.addEventListener(
  "change",
  event => {

    currentSceneKey =
      event.target.value;

    rehearsalIndex = 0;

    renderRehearsal();

  }
);


restartSceneButton.addEventListener(
  "click",
  () => {

    rehearsalIndex = 0;

    renderRehearsal();

  }
);


revealRehearsalButton.addEventListener(
  "click",
  () => {

    rehearsalAnswer.classList.toggle(
      "hidden"
    );

  }
);


rehearsalNextButton.addEventListener(
  "click",
  () => {

    const sceneLines =
      getCurrentSceneLines();

    if (
      rehearsalIndex <
      sceneLines.length - 1
    ) {

      rehearsalIndex++;

      renderRehearsal();

    } else {

      rehearsalIndex = 0;

      renderRehearsal();

    }

  }
);


rehearsalPreviousButton.addEventListener(
  "click",
  () => {

    if (rehearsalIndex > 0) {

      rehearsalIndex--;

      renderRehearsal();

    }

  }
);


/* =========================================================
   LOCAL STORAGE
   ========================================================= */

function loadProgress() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );

    return saved
      ? JSON.parse(saved)
      : {};

  } catch (error) {

    console.error(
      "No se pudo cargar el progreso.",
      error
    );

    return {};

  }

}


function saveProgress() {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(progress)
    );

  } catch (error) {

    console.error(
      "No se pudo guardar el progreso.",
      error
    );

  }

}


resetProgressButton.addEventListener(
  "click",
  () => {

    const confirmation =
      confirm(
        "¿Seguro que quieres borrar todo tu progreso?"
      );

    if (!confirmation) return;

    progress = {};

    saveProgress();

    renderProgress();
    updateHomeProgress();

  }
);


/* =========================================================
   SEGURIDAD HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   INICIO
   ========================================================= */

function initializeApp() {

  learnTotalNumber.textContent =
    orsinoLines.length;

  populateSceneSelector();

  updateHomeProgress();

  renderLearningLine();

}


initializeApp();