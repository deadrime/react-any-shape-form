# Использование itemRules в useArrayField

## Обзор

`itemRules` позволяет валидировать каждый элемент массива независимо, в отличие от обычных `rules`, которые валидируют весь массив целиком.

## Синтаксис

```typescript
const { fields, itemErrors, append, remove, update } = MyForm.useArrayField(
  'fieldName',
  rules?,        // Правила для всего массива (optional)
  itemRules?     // Правила для каждого элемента массива (optional)
);
```

## Параметры

- **field** - имя поля массива
- **rules** (optional) - правила валидации для всего массива:
  - `{ type: 'array', min: 2 }` - минимальное количество элементов
  - `{ type: 'array', max: 10 }` - максимальное количество элементов
  - `{ required: true }` - массив не должен быть пустым
  - Пользовательский валидатор для массива

- **itemRules** (optional) - правила валидации для каждого элемента:
  - `{ required: true }` - элемент не должен быть пустым
  - `{ type: 'email' }` - email валидация
  - `{ type: 'string', min: 3, max: 20 }` - длина строки
  - `{ type: 'number', min: 0, max: 100 }` - диапазон числа
  - `{ pattern: /regex/ }` - regex валидация
  - Пользовательский валидатор для элемента

## Возвращаемые значения

- **fields** - массив значений
- **itemErrors** - массив объектов `{ index: number, errors: ValidationError[] }`
- **append, prepend, remove, update, move** - операции над массивом

## Примеры

### Пример 1: Email список с валидацией

```typescript
const MyForm = createForm({
  emails: [] as string[],
});

function EmailList() {
  const { fields, append, itemErrors } = MyForm.useArrayField(
    'emails',
    [
      { type: 'array', min: 1, message: 'Добавьте хотя бы один email' }
    ],
    [
      { required: true, message: 'Email обязателен' },
      { type: 'email', message: 'Неверный формат email' }
    ]
  );

  return (
    <div>
      {fields.map((email, index) => {
        const error = itemErrors.find(e => e.index === index);

        return (
          <div key={index}>
            <input value={email} />
            {error && <span>{error.errors[0].errorText}</span>}
          </div>
        );
      })}
      <button onClick={() => append('')}>Добавить</button>
    </div>
  );
}
```

### Пример 2: С компонентом Form.ArrayItem

```typescript
<MyForm.ArrayItem
  name="emails"
  rules={[
    { type: 'array', min: 1, message: 'Минимум 1 email' }
  ]}
  itemRules={[
    { required: true, message: 'Email обязателен' },
    { type: 'email', message: 'Неверный email' }
  ]}
>
  {({ fields, itemErrors, append, remove }) => (
    <div>
      {fields.map((email, index) => {
        const error = itemErrors.find(e => e.index === index);

        return (
          <div key={index}>
            <input
              value={email}
              onChange={(e) => {
                MyForm.formApi.setFieldValue('emails',
                  fields.map((em, i) => i === index ? e.target.value : em)
                );
              }}
            />
            <button onClick={() => remove(index)}>×</button>
            {error && <div>{error.errors[0].errorText}</div>}
          </div>
        );
      })}
      <button onClick={() => append('')}>+ Добавить</button>
    </div>
  )}
</MyForm.ArrayItem>
```

### Пример 3: Кастомный валидатор для элементов

```typescript
const { fields, itemErrors } = MyForm.useArrayField(
  'usernames',
  undefined,
  [
    {
      validator: async (value: string) => {
        // Проверка на уникальность username
        const exists = await checkUsernameExists(value);
        if (exists) {
          return Promise.reject('Username уже занят');
        }
      },
      validateTrigger: ['onChange']
    }
  ]
);
```

### Пример 4: Комбинирование нескольких правил

```typescript
const { fields, itemErrors } = MyForm.useArrayField(
  'tags',
  [
    { type: 'array', min: 1, max: 5, message: 'От 1 до 5 тегов' }
  ],
  [
    { required: true, message: 'Тег не может быть пустым' },
    { type: 'string', min: 3, message: 'Минимум 3 символа' },
    { type: 'string', max: 20, message: 'Максимум 20 символов' },
    { pattern: /^[a-zA-Z0-9-]+$/, message: 'Только буквы, цифры и дефис' }
  ]
);
```

## Триггеры валидации

Можно указать, когда запускать валидацию:

- **onChange** - при изменении значения (с debounce)
- **onFinish** - при отправке формы (по умолчанию)

```typescript
const { fields, itemErrors } = MyForm.useArrayField(
  'emails',
  undefined,
  [
    {
      type: 'email',
      message: 'Неверный email',
      validateTrigger: ['onChange']  // Валидация при вводе
    }
  ]
);
```

## Отображение ошибок

```typescript
{itemErrors.map(itemError => (
  <div key={itemError.index}>
    Item {itemError.index}:
    {itemError.errors.map((error, i) => (
      <span key={i}>{error.errorText}</span>
    ))}
  </div>
))}
```

## Важные замечания

1. **itemErrors** обновляется автоматически при:
   - Изменении значений массива
   - Вызове `MyForm.formApi.submit()`
   - Ручном вызове валидации

2. При удалении элемента массива его ошибки автоматически удаляются

3. Валидация элементов массива не блокирует submit формы отдельно - используется общая проверка всех полей

4. `itemRules` и `rules` работают независимо - можно использовать оба одновременно

## Типизация

TypeScript автоматически выведет типы:

```typescript
const MyForm = createForm({
  emails: [] as string[],
  users: [] as { name: string; age: number }[],
});

// Типы автоматически выведутся:
// itemRules для 'emails' будет ValidationRule<string>[]
// itemRules для 'users' будет ValidationRule<{ name: string; age: number }>[]
```
