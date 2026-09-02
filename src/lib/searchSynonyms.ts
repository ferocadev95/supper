/**
 * Cómo escribe en inglés quien busca un producto que el catálogo nombra en
 * español (y al revés). La clave es el término tal como aparece en los títulos
 * de Sanity; los valores, las formas alternativas con que la gente lo busca.
 *
 * Manda el uso de la tienda, no el diccionario: "blueberry" es su propia
 * entrada porque el producto se llama "Blueberry Domo", y "mora" cuelga de
 * "zarzamora" porque esa es la mora que se vende.
 *
 * Reglas al editar:
 * - Todo en minúsculas y sin acentos: las claves se comparan ya normalizadas
 *   (ver `normalizeText`). `searchSynonyms.test.ts` lo verifica.
 * - Basta el singular del lado español. El motor ya resuelve el plural por
 *   prefijo y flexión, así que "zanahoria" encuentra "Zanahoria Baby".
 * - Un alias puede repetirse en varias entradas: "corn" trae elote y maíz.
 * - Los alias de varias palabras funcionan ("green beans"); se prefiere
 *   siempre la frase más larga que coincida.
 */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  // --- Frutas y verduras ---
  aguacate: ["avocado", "avocados"],
  ajo: ["garlic"],
  albahaca: ["basil"],
  apio: ["celery"],
  arugula: ["rocket"],
  berenjena: ["eggplant", "aubergine"],
  betabel: ["beet", "beets", "beetroot"],
  blueberry: ["blueberries", "mora azul", "moras azules", "arandano azul"],
  zarzamora: ["blackberry", "blackberries", "mora", "moras"],
  frambuesa: ["raspberry", "raspberries"],
  fresa: ["strawberry", "strawberries"],
  brocoli: ["broccoli"],
  calabaza: ["squash", "zucchini", "courgette"],
  camote: ["sweet potato", "sweet potatoes", "yam"],
  cebolla: ["onion", "onions"],
  cambray: ["green onion", "green onions", "spring onion", "scallion", "scallions"],
  cebollin: ["chive", "chives"],
  champinon: ["mushroom", "mushrooms"],
  hongo: ["mushroom", "mushrooms"],
  chayote: ["mirliton"],
  chicharo: ["pea", "peas", "green pea", "green peas"],
  chile: ["chili", "chilli", "chili pepper", "chile pepper", "hot pepper", "hot peppers"],
  cilantro: ["coriander", "fresh coriander"],
  ciruela: ["plum", "plums"],
  col: ["cabbage"],
  coliflor: ["cauliflower"],
  durazno: ["peach", "peaches"],
  melocoton: ["peach", "peaches"],
  ejote: ["green bean", "green beans", "string bean", "string beans"],
  elote: ["corn", "sweet corn", "corn on the cob"],
  epazote: ["wormseed"],
  espinaca: ["spinach"],
  esparragos: ["asparagus"],
  germen: ["sprout", "sprouts"],
  alfalfa: ["alfalfa sprouts"],
  soya: ["soy", "soybean", "bean sprouts"],
  guayaba: ["guava"],
  hierbabuena: ["mint", "spearmint"],
  menta: ["mint", "peppermint"],
  jengibre: ["ginger"],
  jitomate: ["tomato", "tomatoes"],
  "tomate verde": ["tomatillo", "tomatillos", "green tomato"],
  jicama: ["yam bean"],
  kale: ["col rizada", "berza"],
  lechuga: ["lettuce"],
  romana: ["romaine"],
  limon: ["lime", "limes", "lemon", "lemons"],
  manzana: ["apple", "apples"],
  granny: ["granny smith"],
  melon: ["cantaloupe"],
  naranja: ["orange", "oranges"],
  nopal: ["cactus", "cactus paddle", "nopales"],
  papa: ["potato", "potatoes"],
  papaya: ["pawpaw"],
  pepino: ["cucumber", "cucumbers"],
  pera: ["pear", "pears"],
  perejil: ["parsley"],
  pimiento: ["bell pepper", "bell peppers", "sweet pepper", "capsicum", "pepper", "peppers"],
  pina: ["pineapple"],
  platano: ["banana", "bananas", "plantain", "plantains"],
  poro: ["leek", "leeks"],
  romero: ["rosemary"],
  rabano: ["radish", "radishes"],
  sandia: ["watermelon"],
  toronja: ["grapefruit"],
  // La fruta del nopal. Ojo: en inglés "tuna" es el atún, que no está en el
  // catálogo; si algún día entra, esta entrada hay que revisarla.
  tuna: ["prickly pear", "prickly pears", "cactus fruit", "cactus pear"],
  uva: ["grape", "grapes"],
  zanahoria: ["carrot", "carrots"],

  // --- Condimentos y especias ---
  anis: ["anise", "aniseed", "star anise"],
  azucar: ["sugar"],
  "bicarbonato de sodio": ["baking soda", "sodium bicarbonate"],
  canela: ["cinnamon"],
  clavo: ["clove", "cloves"],
  comino: ["cumin"],
  consome: ["bouillon", "broth"],
  caldo: ["broth", "stock", "bouillon"],
  curcuma: ["turmeric"],
  pimienta: ["black pepper", "peppercorn", "peppercorns"],
  sal: ["salt"],
  molido: ["ground", "powder", "powdered"],

  // --- Abarrotes ---
  arroz: ["rice"],
  harina: ["flour"],
  trigo: ["wheat"],
  "hot cakes": ["pancake", "pancakes"],
  miel: ["honey"],
  "pan molido": ["breadcrumbs", "bread crumbs"],
  pan: ["bread"],
  fideo: ["noodle", "noodles", "vermicelli"],
  sopa: ["soup"],
  vinagre: ["vinegar"],
  pollo: ["chicken"],

  // --- Frutos secos y varios ---
  arandano: ["cranberry", "cranberries"],
  coco: ["coconut"],
  rallado: ["shredded", "grated"],
  datil: ["date", "dates"],
  "fruta seca": ["dried fruit", "dried fruits"],
  "hoja de maiz": ["corn husk", "corn husks"],
  "hoja de platano": ["banana leaf", "banana leaves"],
  jamaica: ["hibiscus", "hibiscus flower", "roselle"],
  pasas: ["raisin", "raisins"],
  piloncillo: ["brown sugar cone", "unrefined sugar", "panela"],
  tamarindo: ["tamarind"],

  // --- Granos y semillas ---
  ajonjoli: ["sesame", "sesame seed", "sesame seeds"],
  almendra: ["almond", "almonds"],
  amaranto: ["amaranth"],
  avena: ["oat", "oats", "oatmeal", "rolled oats"],
  chia: ["chia seed", "chia seeds"],
  frijol: ["bean", "beans"],
  negro: ["black"],
  garbanzo: ["chickpea", "chickpeas", "garbanzo bean", "garbanzo beans"],
  lentejas: ["lentil", "lentils"],
  linaza: ["flaxseed", "flax seed", "linseed"],
  maiz: ["corn", "maize"],
  pozolero: ["hominy"],
  nuez: ["nut", "nuts", "walnut", "walnuts"],
  "nuez de la india": ["cashew", "cashews"],
  pepita: ["pumpkin seed", "pumpkin seeds"],
  pistache: ["pistachio", "pistachios"],
  pinon: ["pine nut", "pine nuts"],
  quinoa: ["quinua"],
  girasol: ["sunflower"],
  semilla: ["seed", "seeds"],

  // --- Huevo ---
  huevo: ["egg", "eggs"],
  docena: ["dozen"],
};
