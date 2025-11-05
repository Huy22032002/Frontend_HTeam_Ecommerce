import { useEffect, useState } from "react";
import type {
  CreateProduct,
  Option,
  ProductImage,
  Variant,
} from "../../../models/products/CreateProduct";
import { CategoryApi } from "../../../api/catalog/CategoryApi";
import type { Category } from "../../../models/catalogs/Category";
import type { Manufacturer } from "../../../models/manufacturer/Manufacturer";
import { ManufacturerApi } from "../../../api/manufacturer/manufacturerApi";
import { CloudApi } from "../../../api/CloudApi";
import { ProductApi } from "../../../api/product/ProductApi";

const useCreateProduct = () => {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");

  const [variants, setVariants] = useState<Variant[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturerId, setSelectedManufacturerId] = useState("");

  //validate & submit product form
  const validateProductForm = () => {
    if (!productName.trim()) {
      console.error("Tên sản phẩm không được để trống");
      return;
    }
    if (!selectedCategoryId) {
      console.error("Vui lòng chọn danh mục");
      return;
    }

    if (!selectedManufacturerId) {
      console.error("Vui lòng chọn nhà sản xuất");
      return;
    }
  };

  const handleUploadImage = async (files: File[] | null) => {
    if (!files) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("file", file));
    formData.append("folder", "products");

    const imgUrls = await CloudApi.uploadImages(formData);
    if (imgUrls) {
      console.log("list url img uploaded: ", imgUrls);
      return imgUrls;
    }
    return [];
  };

  const submitProductForm = async () => {
    validateProductForm();
    //upload hình lên cloud trước (tất cả hình trong variants/options)
    const updatedVariants: Variant[] = await Promise.all(
      variants.map(async (variant) => {
        const newOptions: Option[] = await Promise.all(
          variant.options.map(async (option) => {
            if (!option.images || option.images.length === 0) return option;

            const filesToUpload = option.images
              .flatMap((img) => img.files || [])
              .filter((f) => f); // lọc undefined

            if (filesToUpload.length === 0) return option;

            const urls = await handleUploadImage(filesToUpload);

            if (urls && urls.length > 0) {
              const newImages: ProductImage[] = urls.map((url, idx) => ({
                productImageUrl: url,
                altTag: filesToUpload[idx].name,
                sortOrder: idx,
              }));
              return { ...option, images: newImages };
            }

            // Nếu không có urls, vẫn return option gốc
            return option;
          })
        );
        return { ...variant, options: newOptions };
      })
    );

    const createProduct: CreateProduct = {
      productName: productName.trim(),
      productDescription: productDescription.trim(),
      categoryIds: selectedCategoryId ? [Number(selectedCategoryId)] : [],
      manufacturerId: Number(selectedManufacturerId),
      variants: updatedVariants,
      taxClassId: 1,
    };

    const data = await ProductApi.createFull(createProduct);
    if (data) {
      alert("Tao Product thanh cong");
      // --- RESET FORM ---
      setProductName("");
      setProductDescription("");
      setVariants([]);
      setSelectedCategoryId("");
      setSelectedManufacturerId("");
    }
  };

  //image
  const handleImageUpload = (
    variantIndex: number,
    optionIndex: number,
    files: FileList | null
  ) => {
    if (!files) return;

    setVariants((prev) => {
      const newVariants = prev.map((v, vi) => {
        if (vi !== variantIndex) return v;
        // clone variant
        const newOptions = v.options.map((opt, oi) => {
          if (oi !== optionIndex) return opt;
          // clone option
          const existing = (opt.images || [])
            .flatMap((img) => img.files || [])
            .map((f) => f.name + "_" + f.size);
          const filesToAdd = Array.from(files!).filter(
            (f) => !existing.includes(f.name + "_" + f.size)
          );
          if (filesToAdd.length === 0) return opt;

          const addedImages = filesToAdd.map((file, idx) => ({
            files: [file],
            productImageUrl: URL.createObjectURL(file),
            altTag: file.name,
            sortOrder: (opt.images?.length || 0) + idx,
          })) as ProductImage[];

          return {
            ...opt,
            images: [...(opt.images || []), ...addedImages],
          };
        });
        return { ...v, options: newOptions };
      });
      return newVariants;
    });
  };

  const handleRemoveImage = (
    variantIndex: number,
    optionIndex: number,
    imageIndex: number
  ) => {
    setVariants((prev) => {
      const newVariants = prev.map((v, vi) => {
        if (vi !== variantIndex) return v;

        const newOptions = v.options.map((opt, oi) => {
          if (oi !== optionIndex) return opt;

          //clone images
          const newImages = [...(opt.images || [])];

          //revoke URL de tranh memory leak
          const removed = newImages[imageIndex];
          if (removed && removed.productImageUrl) {
            URL.revokeObjectURL(removed.productImageUrl);
          }

          //xoa hinh khoi mang
          newImages.splice(imageIndex, 1);
          //update lai sortOrder
          const reOrderd = newImages.map((img, idx) => ({
            ...img,
            sortOrder: idx,
          }));

          return {
            ...opt,
            images: reOrderd,
          };
        });

        return { ...v, options: newOptions };
      });
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
          code: "color",
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
    submitProductForm,
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
    handleRemoveImage,
    handleImageUpload,
    //state
    setProductName,
    setProductDescription,
  };
};

export default useCreateProduct;
