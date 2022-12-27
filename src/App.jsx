import React, { useState, useEffect } from "react";
import {
  transliterate,
  getPeople,
  uploadFile,
  uploadPersonData,
  removePeople,
  removeAllFile,
} from "./api";
import "./App.css";

const App = () => {
  const [person, setPerson] = useState({
    firstName: "",
    lastName: "",
    file: null,
  });
  const [people, setPeople] = useState([]);
  const [giftsOfPeople, setGiftsOfPeople] = useState([]);

  const handleChange = (e) => {
    const name = e.target.name + "";
    let value = name !== "file" ? e.target.value + "" : e.target.files[0];
    setPerson({ ...person, [name]: value });
  };

  const handleUpdate = async () => {
    try {
      const [newPeople, newGiftsOfPeople] = await getPeople();
      setPerson({ firstName: "", lastName: "", file: null });
      setPeople(newPeople);
      setGiftsOfPeople(newGiftsOfPeople);
    } catch (err) {
      setPeople([]);
      setGiftsOfPeople([]);
      console.log(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (person.firstName && person.lastName && person.file) {
        const fileUrl = await uploadFile({
          ...person.file,
          ["name"]:
            transliterate(person.firstName + person.lastName) +
            person.file.name.substring(person.file.name.lastIndexOf(".")),
        });
        await uploadPersonData({ ...person, ["fileUrl"]: fileUrl });
        handleUpdate();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleRemove = async () => {
    try {
      await removePeople();
      await removeAllFile();
      handleUpdate();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    handleUpdate();
  }, []);

  return (
    <div className="app center-col">
      <header className="container header-container">
        <a className="app-logo">
          <h1>
            Секретний <br /> санта🎅
          </h1>
        </a>
      </header>
      <div className="container full-container">
        <section className={"app-srv-block"}>
          <section className="app-srv-block__list center-col">
            <form
              className="app-srv-block__list__add-form"
              onSubmit={handleSubmit}
            >
              <h2>Додай власну відкритку</h2>
              <label className="app-srv-block__list__add-form_button">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Імя"
                  value={person.firstName}
                  onChange={handleChange}
                />
              </label>
              <label className="app-srv-block__list__add-form_button">
                <input
                  type="text"
                  name="lastName"
                  placeholder="Прізвище"
                  value={person.lastName}
                  onChange={handleChange}
                />
              </label>
              <label className="app-srv-block__list__add-form_button">
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  accept=".jpg, .jpeg, .png"
                />
              </label>
              <label className="app-srv-block__list__add-form_button">
                <button className="green-bg" type="submit">
                  Додати
                </button>
              </label>
              <label className="app-srv-block__list__add-form_button">
                <button className="red-bg" onClick={handleRemove}>
                  Очистити
                </button>
              </label>
            </form>
          </section>
          {people.length > 0 && (
            <section className="app-srv-block__list center-col">
              <h2>Санти</h2>
              <ul className="app-srv-block__list__twits">
                {people.map((person, personKey) => {
                  const { firstName, lastName, fileUrl } = person;
                  return (
                    <li
                      className="app-srv-block__list__twits__item"
                      key={personKey}
                    >
                      {`${firstName} ${lastName}`}
                      <a href={fileUrl}>🖼️</a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
          {giftsOfPeople.length > 0 && (
            <section className="app-srv-block__list center-col">
              <h2>Подарунки</h2>
              <ul className="app-srv-block__list__twits">
                {giftsOfPeople.map((gift, giftKey) => {
                  const { firstName, lastName, fileUrl } = gift;
                  return (
                    <li
                      className="app-srv-block__list__twits__item"
                      key={giftKey}
                    >
                      {`${firstName} ${lastName}`}
                      <a href={fileUrl} download>
                        🎁
                      </a>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </section>
      </div>
    </div>
  );
};

export default App;
