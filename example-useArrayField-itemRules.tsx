import React from 'react';
import { createForm } from './src';

// Пример использования useArrayField с itemRules
const MyForm = createForm({
  emails: [] as string[],
  tags: [] as string[],
});

function EmailListExample() {
  const { fields, append, remove, itemErrors } = MyForm.useArrayField(
    'emails',
    // Array-level rules (валидация всего массива)
    [
      {
        type: 'array',
        min: 1,
        message: 'Добавьте хотя бы один email',
      },
    ],
    // Item-level rules (валидация каждого элемента массива)
    [
      {
        required: true,
        message: 'Email обязателен',
      },
      {
        type: 'email',
        message: 'Неверный формат email',
      },
    ]
  );

  return (
    <div>
      <h3>Email List</h3>
      {fields.map((email, index) => {
        const itemError = itemErrors.find(err => err.index === index);

        return (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              value={email}
              onChange={(e) => {
                MyForm.formApi.setFieldValue('emails',
                  fields.map((em, i) => i === index ? e.target.value : em)
                );
              }}
              style={{
                borderColor: itemError ? 'red' : 'gray',
                padding: '5px'
              }}
            />
            <button onClick={() => remove(index)}>Удалить</button>
            {itemError && (
              <div style={{ color: 'red', fontSize: '12px' }}>
                {itemError.errors.map(e => e.errorText).join(', ')}
              </div>
            )}
          </div>
        );
      })}

      <button onClick={() => append('')}>Добавить email</button>
    </div>
  );
}

function TagsExample() {
  const { fields, append, remove, itemErrors } = MyForm.useArrayField(
    'tags',
    undefined,
    // Item-level rules с минимальной/максимальной длиной
    [
      {
        type: 'string',
        min: 3,
        max: 20,
        message: 'Тег должен быть от 3 до 20 символов',
        validateTrigger: ['onChange'],
      },
    ]
  );

  return (
    <div>
      <h3>Tags</h3>
      {fields.map((tag, index) => {
        const itemError = itemErrors.find(err => err.index === index);

        return (
          <div key={index} style={{ marginBottom: '10px' }}>
            <input
              value={tag}
              onChange={(e) => {
                MyForm.formApi.setFieldValue('tags',
                  fields.map((t, i) => i === index ? e.target.value : t)
                );
              }}
              style={{
                borderColor: itemError ? 'red' : 'gray',
                padding: '5px'
              }}
            />
            <button onClick={() => remove(index)}>×</button>
            {itemError && (
              <div style={{ color: 'red', fontSize: '12px' }}>
                {itemError.errors[0].errorText}
              </div>
            )}
          </div>
        );
      })}

      <button onClick={() => append('')}>+ Добавить тег</button>
    </div>
  );
}

export default function App() {
  const handleSubmit = async () => {
    try {
      const values = await MyForm.formApi.submit();
      console.log('Form values:', values);
      alert('Форма успешно отправлена!');
    } catch (errors) {
      console.error('Validation errors:', errors);
      alert('Ошибки валидации!');
    }
  };

  return (
    <MyForm onSubmit={handleSubmit}>
      <div style={{ padding: '20px', maxWidth: '600px' }}>
        <h2>Пример useArrayField с itemRules</h2>

        <EmailListExample />

        <hr style={{ margin: '20px 0' }} />

        <TagsExample />

        <hr style={{ margin: '20px 0' }} />

        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Отправить форму
        </button>
      </div>
    </MyForm>
  );
}
