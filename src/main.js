const { readTextFile, writeTextFile } = window.__TAURI__.fs;
const { open } = window.__TAURI__.dialog;
const { homeDir, appDir, basename } = window.__TAURI__.path;
const { WindowEvent } = window.__TAURI__.window;
const invoke = window.__TAURI__.invoke

const days  = Array.from(document.querySelectorAll(".day"));
const notes = Array.from(document.querySelectorAll("textarea"));

document.addEventListener("keydown", async (e) => {
  if (e.metaKey === true && e.key === "s") {
    e.preventDefault();
    console.log("metakey and s");
    await saveLocalStorageToFile('data.json');
  } else if (e.metaKey === true && e.key === "l") {
    e.preventDefault();
    console.log("metakey and l");
    await loadDataFromFile('data.json');
    updateHTMLFromLocalStorage();
  } else if (e.metaKey === true && e.key === "t") {
    e.preventDefault();
    console.log("metakey and t");
    invoke('my_custom_command')
  } else if (e.metaKey === true && e.key === ",") {
    e.preventDefault();
    console.log("metakey and t");
    const selected = await selectDirectory()
    savePathToLocalStorage(selected)
  }
});

function hightlightCurrentDay() {
  if (document.visibilityState != 'visible') { return; }

  var today = new Date();

  days.forEach((day, index) => {
    unhighlightDay(day);
    if (index === today.getDay() - 1) {
      // highlightDay(day, today.getDate() + "." + (today.getMonth() + 1) + ".");
      highlightDay(day, `${today.getMonth() + 1}/${today.getDate()}`);
    }
  });
}

function highlightDay(day, dateString) {
  day.setAttribute("aria-current", "date");

  let span = document.createElement("span");
  span.innerHTML = dateString;

  day.querySelector("textarea").setAttribute("autofocus", true);
  day.querySelector("textarea").focus();
  day.querySelector(".heading").append(span);
}

function unhighlightDay(day) {
  day.removeAttribute("aria-current");
  day.querySelector("textarea").removeAttribute("autofocus");
  let existingSpan = day.querySelector(".heading > span");
  if (existingSpan != null) { existingSpan.remove() }
}

function getLocalStorageData() {
  let data = {};
  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    data[key] = localStorage.getItem(key);
  }
  return JSON.stringify(data, null, 2);
}

async function saveToFile(filename, data) {
  try {
    await writeTextFile(filename, data);
    console.log(`Data successfully saved to ${filename}`);
  } catch (error) {
    console.error('Failed to save data:', error);
  }
}

function savePathToLocalStorage(filename) {
  localStorage.setItem("configPath", filename);
}

function getConfigPath() {
  const configPath = localStorage.getItem("configPath");
  if (!configPath || configPath.trim() === '') {
    console.warn('Failed to find configuration directory, use cmd+,');
    return;
  }
  return configPath;
}

async function saveLocalStorageToFile(filename) {
  const configPath = getConfigPath()
  const data = getLocalStorageData();
  saveToFile(`${configPath}/${filename}`, data);
}

async function loadDataFromFile(filename) {
  try {
      const configPath = getConfigPath()
      const fileContents = await readTextFile(`${configPath}/${filename}`);
      const data = JSON.parse(fileContents);

      for (const [key, value] of Object.entries(data)) {
        localStorage.setItem(key, value);
      }
      console.log('Data loaded and saved to local storage successfully');
  } catch (error) {
    console.error('Failed to load data from file:', error);
  }
}

function updateHTMLFromLocalStorage() {
  const notes = Array.from(document.querySelectorAll("textarea"));
  notes.forEach(note => {
    const id = note.id;
    note.value = localStorage.getItem(id) || ''; // Set to empty string if no data
  });
}

async function selectDirectory() {
  let selected = "";
  try {
      selected = await open({
      directory: true,
      multiple: false,
      filters: [{ name: 'Text Files', extensions: ['json'] }]
    });

    if (selected) {
      console.log('Selected Directory:', selected);
      await invoke('expand_scope', { configPath: selected }); // Example of invoking a Tauri command
    } else {
      console.log('No directory selected');
    }
  } catch (error) {
    console.error('Error opening directory dialog:', error);
  }

  return selected;
}

hightlightCurrentDay();
document.addEventListener('visibilitychange', hightlightCurrentDay);

notes.forEach(note => {
  const id = note.id;
  note.value = localStorage.getItem(id);
  note.addEventListener("input", e => {
    localStorage.setItem(id, note.value);
  });
});
