# Env placeholders case study
Environment variables replacement with **string interpolation** and **mustache placeholders**.

### Example Environment

This is the environment used in the examples below.

```js
const env = {
   name: 'Henry',
   norse_game: 'Valheim',
   favorite_game: '{{ norse_game }}',
   most_played_games: {
      gta_v_online: '+1000 hours'
   },
   main_code_lang: 'javascript'
};
```
### Key-Value pair
All the processing done in the `key` are described as *Key cases*. All the processing done in the `value` are described as *Value cases*.

```js
{ key: 'value' }
```

## Value cases

### Simple interpolation case

Simple string interpolation.

```js
// Raw:
env({ name: '{{ name }}' })

// Processed:
env({ name: 'Henry' })
```

### Nested/Recursive interpolation case

String interpolation using nesting/recursive processing.

```js
// Raw:
env({ name: '{{ favorite_game }}' })

// First process:
env({ name: '{{ norse_game }}' })

// Second process:
env({ name: 'Valheim' })
```

### Dot Notation interpolation case

String interpolation using dot notation.

```js
// Raw:
env({ name: '{{ most_played_games.gta_v_online }}' })

// Processed:
env({ name: '+1000 hours' })
```

## Key cases

### Simple interpolation case

```js
// Raw:
env({ '{{ main_code_lang }}': 'The language I am most proficient at.' })

// Processed:
env({ javascript: 'The language I am most proficient at.' })
```
### Exposed case

Exposes the value to the browser, so it can be accessed within the `console` through the variable `_$fb`.

```js
// Raw:
env({ `@exposed:fruits`: ['apple', 'banana'] })

// Processed:
env({ fruits: ['apple', 'banana'] })
```