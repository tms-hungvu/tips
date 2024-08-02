import { PlusOutlined } from '@ant-design/icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Image, Input, Upload } from 'antd';
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
  colors: z
    .array(
      z.object({
        image: z
          .custom<File>((file) => {
            if (file instanceof File) {
              const fileType = file.type.split('/')[0];
              return fileType === 'image';
            }
            return false;
          }, 'File must be an image')
          .refine((file) => file != null, 'Image is required'),
        name: z.string().nonempty('Name is required'),
      }),
    )
    .superRefine((colors, ctx) => {
      const names = colors.map((color) => color.name);

      const duplicateIndices = findDuplicateIndices(names);

      duplicateIndices.forEach((index) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [`${index}.name`],
          message: 'Name must be unique.',
        });
      });
    }),
});

const Second = () => {
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
      colors: [{ image: null, name: '' }],
    },
    resolver: zodResolver(colorsSchema),
  });
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'colors',
  });

  const colorsCurrent = useWatch({
    control,
    name: 'colors',
  });

  const onSubmit = (data: any) => {
    console.log('submit >>', data);
  };
  const onChangeFile = (file: any, index: any) => {
    const newData = {
      image: file.originFileObj,
      name: colorsCurrent[index].name,
    };
    update(index, newData);
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      setError(`colors.${index}.image`, {
        type: 'custom',
        message: 'File must be an image',
      });
    } else {
      clearErrors(`colors.${index}.image`);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-wrap gap-3">
          {fields.map((field: any, index) => (
            <div key={field.id} className="flex flex-col gap-3">
              <Upload
                name={`colors.${index}.image`}
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                maxCount={1}
                onChange={({ file }) => {
                  onChangeFile(file, index);
                }}
              >
                {field.image ? (
                  <Image
                    preview={false}
                    alt="image"
                    width={200}
                    src={URL.createObjectURL(field.image)}
                  />
                ) : (
                  <button
                    style={{ border: 0, background: 'none' }}
                    type="button"
                  >
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Upload</div>
                  </button>
                )}
              </Upload>
              {errors?.colors && errors?.colors[index] && (
                <span className="text-red-500">
                  {errors?.colors[index]?.image?.message}
                </span>
              )}
              <Controller
                name={`colors.${index}.name`}
                control={control}
                render={({ field }) => (
                  <Input
                    type="text"
                    placeholder="Enter name"
                    {...field}
                  />
                )}
              />
              {errors?.colors && errors?.colors[index] && (
                <span className="text-red-500">
                  {errors?.colors[index]?.name?.message}
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
        onClick={() => append({ image: null, name: '' })}
      >
        Add Color
      </button>
    </>
  );
};

Second.auth = true;
export default Second;
