import { useEffect, useState } from "react";
import type {
  ProductImage,
  Variant,
} from "../../../models/products/CreateProduct";
import { CategoryApi } from "../../../api/catalog/CategoryApi";
import type { Category } from "../../../models/catalogs/Category";
import type { Manufacturer } from "../../../models/manufacturer/Manufacturer";
import { ManufacturerApi } from "../../../api/manufacturer/manufacturerApi";

const useCreateProduct = () => {
  const [variants, setVariants] = useState<Variant[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState("");

  //image
  const handleImageUpload = (
    variantIndex: number,
    optionIndex: number,
    files: FileList | null
  ) => {
    if (!files) return;

    setVariants((prev) => {
      const newVariants = [...prev];
      const option = newVariants[variantIndex].options[optionIndex];

      // Lấy danh sách tất cả file name đã có trong option.images
      const existingFiles =
        option.images?.flatMap((img) => img.files || []).map((f) => f.name) ||
        [];

      const newFilesArray = Array.from(files).filter(
        (file) => !existingFiles.includes(file.name)
      );

      if (newFilesArray.length === 0) return newVariants; // nếu toàn trùng, return luôn

      const newImages: ProductImage[] = [
        ...(option.images || []),
        {
          files: newFilesArray, // lưu mảng file
          productImageUrl: newFilesArray.map((file) =>
            URL.createObjectURL(file)
          )[0], // preview lấy file đầu tiên
          altTag: newFilesArray[0].name,
          sortOrder: option.images?.length || 0,
        },
      ];

      option.images = newImages;

      return newVariants;
    });
  };

  const handleAddVariant = () => {
    setVariants([...variants, { name: "", code: "", options: [] }]);
  };

  const handleVariantChange = (
    variantIndex: number,
    field: string,
    value: string
  ) => {
    const updated = [...variants];
    updated[variantIndex] = {
      ...updated[variantIndex],
      [field]: value,
    };
    setVariants(updated);
  };

  const handleRemoveVariant = (variantIndex: number) => {
    setVariants(variants.filter((_, i) => i != variantIndex));
  };

  const handleAddOption = (variantIndex: number) => {
    const updated = [...variants]; //tạo ra bản copy của variants
    updated[variantIndex] = {
      ...updated[variantIndex],
      options: [
        ...updated[variantIndex].options,
        {
          sku: "",
          code: "màu",
          value: "",
          availability: { regularPrice: 0, salePrice: 0, quantity: 0 },
        },
      ],
    };
    setVariants(updated);
  };

  const handleOptionChange = (
    variantIndex: number,
    optionIndex: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...variants];

    // Lấy ra variant hiện tại
    const currentVariant = updated[variantIndex];
    // Lấy ra option hiện tại
    const currentOption = currentVariant.options[optionIndex];
    // Copy option ra biến mới
    let newOption = { ...currentOption };

    if (field in currentOption.availability) {
      newOption.availability = {
        ...currentOption.availability,
        [field]: value,
      };
    } else {
      newOption = {
        ...currentOption,
        [field]: value,
      };
    }
    // Cập nhật option mới vào mảng options
    const newOptions = [...currentVariant.options];
    newOptions[optionIndex] = newOption;

    // Cập nhật lại variant
    updated[variantIndex] = {
      ...currentVariant,
      options: newOptions,
    };

    // Cập nhật lại state → React render lại
    setVariants(updated);
  };

  const handleRemoveOption = (variantIndex: number, optionIndex: number) => {
    const updated = [...variants];
    updated[variantIndex].options = updated[variantIndex].options.filter(
      (_, i) => i !== optionIndex //chỉ dùng index để xoá nên dùng _
    );
    setVariants(updated);
  };

  const getAllCategory = async () => {
    await CategoryApi.getAllNoPaging().then(setCategories);
  };

  const getAllManufacturer = async () => {
    const data = await ManufacturerApi.getAll();
    if (data.length > 0) {
      setManufacturers(data);
    }
  };

  useEffect(() => {
    getAllCategory();
    getAllManufacturer();
  }, []);

  return {
    variants,
    setVariants,
    handleAddVariant,
    handleAddOption,
    handleVariantChange,
    handleOptionChange,
    handleRemoveOption,
    handleRemoveVariant,
    //categories
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    //manufacturer
    manufacturers,
    selectedManufacturerId,
    setSelectedManufacturerId,
    //image
    handleImageUpload,
  };
};

export default useCreateProduct;
