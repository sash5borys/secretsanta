import { initializeApp } from "firebase/app";
import {
  getStorage,
  ref as refStorage,
  uploadBytes,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import {
  getDatabase,
  ref as refDb,
  push,
  get,
  remove,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB4o_JIXqFl30x_mkZw2WZgWdpxXLNHNgU",
  authDomain: "secretsanta-2023.firebaseapp.com",
  projectId: "secretsanta-2023",
  storageBucket: "secretsanta-2023.appspot.com",
  messagingSenderId: "188242428641",
  appId: "1:188242428641:web:a7ab57109a7f712132eda0",
  databaseURL:
    "https://secretsanta-2023-default-rtdb.europe-west1.firebasedatabase.app",
};
const app = initializeApp(firebaseConfig);
const storageRef = refStorage(getStorage(app), "images");
const dbRef = refDb(getDatabase(app), "people");

function shuffle(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = newArr[i];
    newArr[i] = newArr[j];
    newArr[j] = temp;
  }
  return newArr;
}

export function transliterate(word) {
  const dictionary = {
    Ё: "YO",
    Й: "I",
    Ц: "TS",
    У: "U",
    К: "K",
    Е: "E",
    Н: "N",
    Г: "G",
    Ш: "SH",
    Щ: "SCH",
    З: "Z",
    Х: "H",
    Ъ: "'",
    ё: "yo",
    й: "i",
    ц: "ts",
    у: "u",
    к: "k",
    е: "e",
    н: "n",
    г: "g",
    ш: "sh",
    щ: "sch",
    з: "z",
    х: "h",
    ъ: "'",
    Ф: "F",
    Ы: "I",
    В: "V",
    А: "А",
    П: "P",
    Р: "R",
    О: "O",
    Л: "L",
    Д: "D",
    Ж: "ZH",
    Э: "E",
    ф: "f",
    ы: "i",
    в: "v",
    а: "a",
    п: "p",
    р: "r",
    о: "o",
    л: "l",
    д: "d",
    ж: "zh",
    э: "e",
    Я: "Ya",
    Ч: "CH",
    С: "S",
    М: "M",
    И: "I",
    Т: "T",
    Ь: "'",
    Б: "B",
    Ю: "YU",
    я: "ya",
    ч: "ch",
    с: "s",
    м: "m",
    и: "i",
    т: "t",
    ь: "'",
    б: "b",
    ю: "yu",
  };
  const newWord = word
    .split("")
    .map(function (char) {
      return dictionary[char] || char;
    })
    .join("");
  return newWord;
}

function sortAlphabetical(a, b) {
  return a.firstName.localeCompare(b.firstName);
}

function selectGiftsForPeople(peopleList) {
  if (peopleList.length % 2 == 0) {
    const newPeople = shuffle(peopleList);
    newPeople.reduce((acc, curr, keyCurr) => {
      if (keyCurr % 2 != 0)
        [acc.fileUrl, curr.fileUrl] = [curr.fileUrl, acc.fileUrl];
      return curr;
    });
    return newPeople;
  }
  return [];
}

export const getPeople = async () => {
  try {
    const snapshot = await get(dbRef);
    const newPeople = Object.values(snapshot.val());
    newPeople && newPeople.sort(sortAlphabetical);
    const newGiftsOfPeople = selectGiftsForPeople(
      JSON.parse(JSON.stringify(newPeople))
    );
    newGiftsOfPeople && newGiftsOfPeople.sort(sortAlphabetical);
    return [newPeople, newGiftsOfPeople];
  } catch (err) {
    throw "Немає учасників для розіграшу!";
  }
};

export const uploadFile = async (file) => {
  try {
    const fileRef = refStorage(getStorage(app), `images/${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const fileUrl = await getDownloadURL(snapshot.ref);
    return fileUrl;
  } catch (err) {
    throw "Проблеми із підключенням до бд";
  }
};

export const uploadPersonData = async (userData) => {
  try {
    await push(dbRef, { ...userData });
  } catch (err) {
    throw "Проблеми із підключенням до бд";
  }
};

export const removePeople = async () => {
  try {
    await remove(dbRef);
  } catch (err) {
    if (err) throw err;
    throw "Проблеми із підключенням до бд";
  }
};

export const removeAllFile = async () => {
  const fileList = await listAll(storageRef);
  for (const file of fileList.items) {
    await deleteObject(file);
  }
};
