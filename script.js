const flipCard = document.querySelector(".flip-card");
const cardFront = document.querySelector("#card-front h1");
const cardBack = document.querySelector("#card-back h1");
const cardBackExample = document.querySelector("#card-back p span");
const nextButton = document.querySelector("#next");
const backButton = document.querySelector("#back");
const examButton = document.querySelector("#exam");
const currentWord = document.querySelector("#current-word");
const wordsProgress = document.querySelector("#words-progress");
const examProgress = document.querySelector("#exam-progress");
const totalWord = document.querySelector("#total-word");
const shuffleWords = document.querySelector("#shuffle-words");
const studyMode = document.querySelector(".sidebar #study-mode");;
const examMode = document.querySelector(".sidebar #exam-mode");;
const sliderControls = document.querySelector(".slider-controls");
const divExamCards = document.querySelector("#exam-cards");
const divContent = document.querySelector(".content");
const correctPercent = document.querySelector("#correct-percent");
const resultsModal = document.querySelector(".results-modal");
const timeValue = document.querySelector("#timer");
const wordStats = document.querySelector("#word-stats");
const timer = document.querySelector("#time");
const str = timer.textContent.split(":");
let time = parseInt(str[0]) + parseInt(str[1]);

const statistics = {};

const cards = [
    {word: 'apple', translation: 'яблоко', example: 'apple is green'},
    {word: 'home', translation: 'дом', example: 'comfortable home'},
    {word: 'street', translation: 'улица', example: 'wide street'},
    {word: 'dog', translation: 'собака', example: 'favorite dog'},
    {word: 'popcorn', translation: 'попкорн', example: 'popcorn with a cheese'},
];

let index = 0;
let correctCount = 0;
let totalAnswers = cards.length;

function makeCard(card) {
    cardFront.textContent = card.word;
    cardBack.textContent = card.translation;
    cardBackExample.textContent = card.example;
    
    flipCard.addEventListener('click', () => {
        flipCard.classList.toggle("active");
    });
};

function handleControls(index) {
    nextButton.disabled = index === cards.length - 1;
    backButton.disabled = index === 0;
  
    prepareSidebar(index);
};

function prepareSidebar(index) {
    currentWord.textContent = index + 1;
    wordsProgress.value = (index + 1) / cards.length * 100;
};

makeCard(cards[index]);
prepareSidebar(index);

shuffleWords.addEventListener('click', () => {
    cards.sort(() => Math.random() - 0.5);
    makeCard(cards[index]);
    //saveProgress(); 
});

function trackProgress(correctCount) {
  examProgress.value = (correctCount / totalAnswers * 2) * 100;
  correctPercent.textContent = `${Math.round(examProgress.value)}%`;
};

sliderControls.addEventListener('click', (event) => {
    switch (event.target.id) {
      case "back":
        if (index - 1 >= 0) {
          makeCard(cards[--index]);
          handleControls(index);
        }
        break;
      case "next":
        if (index + 1 < cards.length) {
          makeCard(cards[++index]);
          handleControls(index); 
        }
        break;
      case "exam":
        makeExamCards();
        break;  
    }
});

function makeExamCards() {
    flipCard.classList.add("hidden");
    sliderControls.classList.add("hidden");

    studyMode.classList.add("hidden");
    examMode.classList.remove("hidden");

    renderExamCards();
};

function renderExamCards() {
  const fragment = document.createDocumentFragment();
  let cardsArray = [];

  cards.forEach(card => {
    const cardEng = makeExamCard(card.word, true); 
    cardsArray.push(cardEng);
    const cardRus = makeExamCard(card.translation);
    cardsArray.push(cardRus);      
  });

cardsArray = shuffleCards(cardsArray);
  
cardsArray.forEach(card => {
  fragment.append(card);
});
  
  divExamCards.innerHTML = '';
  divExamCards.append(fragment);
};

let dictionary = {};
let selectedWord = null;
let removedCardsCount = 0;
let timerId;
let attempts = {};

examButton.addEventListener('click', function() {
  timerId = setInterval(() => {
    time++;
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60; 
  
    timer.textContent = `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }, 1000);
});

function makeExamCard(word, isOriginal) {
  const cardContainer = document.createElement("div");
  cardContainer.classList.add("card");

  cardContainer.textContent = word;

    cardContainer.addEventListener("click", function() {

      if (cardContainer.classList.contains("fade-out")) {
        return;
      }
   
      if (!selectedWord) {
        selectedWord = cardContainer;
        cardContainer.classList.add("correct");
      } else {
        setStatistic(word, isOriginal);
        if (dictionary[this.textContent] === selectedWord.textContent) {
          cardContainer.classList.add("correct");
          selectedWord.classList.add("correct");
          removeCards(cardContainer, selectedWord);
          correctCount++
          trackProgress(correctCount);
        } else {
            cardContainer.classList.add("wrong");
            resetCards();
          }
          
          selectedWord = null;
          checkProgress();
        }
    });
  
  return cardContainer;
};

function resetCards() {
  const correctCards = document.querySelectorAll(".correct");
  const inCorrectCards = document.querySelectorAll(".wrong");

  setTimeout(() => {
    [...correctCards, ...inCorrectCards].forEach((card) => {
      if (!card.classList.contains("fade-out")) {
        card.className = "card";
      }
    });
  }, 500);
};

function removeCards(cardContainer, selectedCard) {
  cardContainer.classList.add("fade-out");
  selectedCard.classList.add("fade-out");

  totalAnswers++;
};

function setStatistic(word, isOriginal) {
  let key = word;
  if (!isOriginal) {
    key = cards.find((it) => it.translation === word).word;
  }
  statistics[key] = ++statistics[key] || 1;
};

function showModal() {
  const wordStatTemplate = document.querySelector("#word-stats");
  const modalContent = resultsModal.querySelector(".results-content");
  const fragment = new DocumentFragment();
  console.log(statistics, 'statistics');
  
  Object.entries(statistics).forEach(([word, attempts]) => {
    const wordStat = wordStatTemplate.content.cloneNode(true);
    console.log(wordStat, 'wordStat');
    wordStat.querySelector(".word span").textContent = word;
    wordStat.querySelector(".attempts span").textContent = attempts;
    fragment.append(wordStat);
  });
  
  modalContent.append(fragment);
  resultsModal.querySelector(".time").textContent = timer.textContent;
  resultsModal.classList.remove("hidden");
};


function shuffleCards(cardsArray) {
  return cardsArray.sort(() => Math.random() - 0.5);
};

function fillDictionary(cards) {
  cards.forEach(card => {
  dictionary[card.word] = card.translation;
  dictionary[card.translation] = card.word;
  });
};

fillDictionary(cards);

function checkProgress() {
  if (correctCount === cards.length) {
    setTimeout(() => {
      clearInterval(timerId);
      alert("Проверка знаний успешно завершена!");
      showModal();
    }, 100);
  }
};

