import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from 'antd';
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { z } from 'zod';

const findDuplicateIndices = (names: string[]): number[] => {
  const seen = new Set<string>();
  const duplicates = new Set<number>();

  names.forEach((name, index) => {
    if (seen.has(name)) {
      duplicates.add(index);
    } else {
      seen.add(name);
    }
  });

  return Array.from(duplicates);
};

const colorsSchema = z.object({
  variants: z
    .array(
      z.object({
        value: z.string().nonempty('Value is required'),
      }),
    )
    .superRefine((colors, ctx) => {
      const names = colors.map((color) => color.value);

      const duplicateIndices = findDuplicateIndices(names);

      duplicateIndices.forEach((index) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`${index}.value`],
          message: 'Value must be unique.',
        });
      });
    }),
});
const Messages = () => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    trigger,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      variants: [{ value: '' }],
    },
    resolver: zodResolver(colorsSchema),
  });
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'variants',
  });

  const onSubmit = (data: any) => {
    console.log('submit >>', data);
  };

  const variantsCurrent = useWatch({
    control,
    name: 'variants',
  });
  console.log(fields);
  const handleAddField = (id: string) => {
    console.log(id);
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap gap-3">
          {fields.map((item: any, index) => (
            <div key={item.id} className="flex flex-col gap-3">
              <Controller
                name={`variants.${index}.value`}
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    placeholder="Enter value"
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      //handleAddField(item.id);
                    }}
                    value={field.value}
                  />
                )}
              />

              {errors?.variants && errors?.variants[index] && (
                <span className="text-red-500">
                  {errors?.variants[index]?.value?.message}
                </span>
              )}

              <button type="button" onClick={() => remove(index)}>
                Remove
              </button>
            </div>
          ))}
        </div>

        <button className="mt-4" type="submit">
          Submit
        </button>
      </form>
      <button
        className="my-4"
        type="button"
        onClick={() => append({ value: '' })}
      >
        Add Variant
      </button>
    </>
  );
};

Messages.auth = true;
export default Messages;
