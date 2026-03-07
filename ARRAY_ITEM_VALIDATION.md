# Array Item Validation

Библиотека поддерживает валидацию каждого элемента массива отдельно через проп `itemRules` в `Form.ArrayItem` и параметр в хуке `useArrayField`.

## Основные возможности

### 1. Индивидуальная валидация элементов
- Каждый элемент массива может иметь свои правила валидации
- Ошибки отображаются для конкретного элемента по индексу
- Поддержка всех встроенных правил: `required`, `min`, `max`, `pattern`, `email`, `type`
- Поддержка кастомных валидаторов

### 2. Типы

```typescript
export type ArrayItemError<T = unknown> = {
  index: number;           // Индекс элемента с ошибкой
  errors: ValidationError<T>[]; // Массив ошибок для этого элемента
}
```

### 3. API в FormApi

```typescript
// Установить правила валидации для элементов массива
formApi.setArrayItemRules(field, rules);

// Получить ошибки элементов массива
formApi.getArrayItemErrors(field);

// Провалидировать элементы массива
await formApi.validateArrayItems(field, trigger);

// Подписаться на изменения ошибок элементов
formApi.onArrayItemError(field, (errors) => { ... });
```

## Примеры использования

### Пример 1: Form.ArrayItem с itemRules

```tsx
import { useForm } from 'react-any-shape-form';

const MyForm = useForm({ emails: [] as string[] });

<MyForm.ArrayItem
  name="emails"
  rules={[
    { type: "array", min: 1, message: "Add at least one email" }
  ]}
  itemRules={[
    { required: true, message: "Email is required" },
    { type: "email", message: "Invalid email format" }
  ]}
>
  {({ fields, update, append, remove, itemErrors }) => (
    <div>
      {fields.map((email, index) => {
        const itemError = itemErrors.find(e => e.index === index);

        return (
          <div key={index}>
            <input
              value={email}
              onChange={(e) => update(index, e.target.value)}
              className={itemError ? 'error' : ''}
            />
            {itemError && (
              <span className="error-message">
                {itemError.errors.map(e => e.errorText).join(', ')}
              </span>
            )}
            <button onClick={() => remove(index)}>Remove</button>
          </div>
        );
      })}
      <button onClick={() => append("")}>Add Email</button>
    </div>
  )}
</MyForm.ArrayItem>
```

### Пример 2: useArrayField хук

```tsx
const MyForm = useForm({ tags: [] as string[] });

const { fields, update, append, remove, itemErrors } = MyForm.useArrayField(
  "tags",
  // Правила для массива в целом
  [{ type: "array", min: 1, message: "Add at least one tag" }],
  // Правила для каждого элемента
  [
    { required: true, message: "Tag is required" },
    { min: 3, message: "Min 3 characters" }
  ]
);

return (
  <div>
    {fields.map((tag, index) => {
      const itemError = itemErrors.find(e => e.index === index);
      return (
        <div key={index}>
          <input
            value={tag}
            onChange={(e) => update(index, e.target.value)}
          />
          {itemError && <span>{itemError.errors[0].errorText}</span>}
        </div>
      );
    })}
  </div>
);
```

### Пример 3: Кастомная валидация элементов

```tsx
<MyForm.ArrayItem
  name="userIds"
  itemRules={[
    {
      validator: async (value, rule, formState) => {
        // Асинхронная проверка на дубликаты
        const response = await fetch(`/api/check-user/${value}`);
        if (!response.ok) {
          return Promise.reject('User not found');
        }
      },
      message: "User not found",
      validateTrigger: ["onChange", "onFinish"]
    }
  ]}
>
  {({ fields, update, itemErrors }) => (
    // render...
  )}
</MyForm.ArrayItem>
```

## Интеграция с валидацией формы

Валидация элементов массива автоматически интегрирована в процесс валидации формы:

- При вызове `formApi.validateFields()` автоматически валидируются все элементы массивов с установленными `itemRules`
- При вызове `formApi.submit()` валидация элементов массива происходит автоматически
- Ошибки элементов массива включаются в общий список ошибок формы

### Валидация элементов:
```tsx
<Form.ArrayItem
  name="items"
  itemRules={[
    { required: true, message: "Item is required" }
  ]}
>
  {({ fields, itemErrors }) => (
    {fields.map((field, index) => {
      const error = itemErrors.find(e => e.index === index);
      // Можно показать ошибку для конкретного элемента!
    })}
  )}
</Form.ArrayItem>
```

## Типы и TypeScript

Библиотека полностью типизирована:

```typescript
// Типы автоматически выводятся из состояния формы
const Form = useForm({
  emails: [] as string[]
});

// itemRules типизированы как ValidationRule<string>[]
<Form.ArrayItem
  name="emails"
  itemRules={[...]} // TypeScript знает, что это правила для string
>
```

## См. также

- [Form.stories.tsx](./stories/Form.stories.tsx) - пример `ArrayItemValidationExample`
- [demo-array-validation.tsx](./demo-array-validation.tsx) - дополнительные примеры
- [types.ts](./src/types.ts) - определение типа `ArrayItemError`
- [FormApi.ts](./src/FormApi.ts) - реализация методов валидации элементов массива
