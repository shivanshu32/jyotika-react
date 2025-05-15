import React from 'react';

function Form({ fields, onSubmit, initialValues = {}, submitLabel = 'Submit' }) {
  const [formData, setFormData] = React.useState(initialValues);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map((field, index) => (
        <div key={index}>
          <label
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700"
          >
            {field.label}
          </label>
          <div className="mt-1">
            {field.type === 'textarea' ? (
              <textarea
                id={field.name}
                name={field.name}
                rows={field.rows || 3}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
              />
            ) : (
              <input
                type={field.type || 'text'}
                id={field.name}
                name={field.name}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={formData[field.name] || ''}
                onChange={handleChange}
                required={field.required}
              />
            )}
          </div>
          {field.description && (
            <p className="mt-2 text-sm text-gray-500">
              {field.description}
            </p>
          )}
        </div>
      ))}
      <div className="pt-5">
        <div className="flex justify-end">
          <button
            type="submit"
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

export default Form;
