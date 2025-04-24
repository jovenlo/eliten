// Supabase configuration
const SUPABASE_URL = 'https://bjcwyyifoklzvtfcxjnz.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJqY3d5eWlmb2tsenZ0ZmN4am56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MjM3MTQsImV4cCI6MjA2MDE5OTcxNH0.S3TAzmjSqE9VZkoUEdRMCVivpKmA0DEmN1rH9RqofFQ';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window.localStorage
    }
});

// Product management functions
async function saveProduct(productData) {
    try {
        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            // Show login form or redirect to login page
            window.location.href = 'loginpage.html';
            return;
        }

        console.log('Starting product save process...');
        console.log('Product data:', productData);

        if (!productData.image) {
            throw new Error('No image file provided');
        }

        // Upload image to Supabase Storage
        const imageFile = productData.image;
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        console.log('Uploading image to storage...');
        const { data: imageData, error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, imageFile, {
                cacheControl: '3600',
                upsert: false,
                contentType: imageFile.type
            });
            
        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
        }
        
        console.log('Image uploaded successfully:', imageData);
        
        // Get public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName);
            
        // Ensure the URL is public and accessible
        const cleanPublicUrl = publicUrl.split('?')[0];
        console.log('Image public URL:', cleanPublicUrl);

        // Save product data to Supabase
        console.log('Saving product to database...');
        const { data, error } = await supabase
            .from('products')
            .insert([
                {
                    name: productData.name,
                    price: productData.price,
                    stock: productData.stock,
                    description: productData.description,
                    image_url: cleanPublicUrl,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ])
            .select();
            
        if (error) {
            console.error('Database insert error:', error);
            throw new Error(`Failed to save product: ${error.message}`);
        }
        
        console.log('Product saved successfully:', data);
        return data[0].id;
    } catch (error) {
        console.error('Error in saveProduct:', error);
        throw error;
    }
}

// Expose loadProducts function to window object
window.loadProducts = async function() {
    try {
        console.log('Loading products...');
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error loading products:', error);
            throw error;
        }

        // Process image URLs to ensure they're accessible
        const processedData = data.map(product => {
            if (product.image_url) {
                // If the URL is from Supabase storage, ensure it's public
                if (product.image_url.includes('supabase.co')) {
                    // Remove any query parameters that might cause issues
                    product.image_url = product.image_url.split('?')[0];
                }
            } else {
                // Use a fallback image if no image URL is available
                product.image_url = 'https://placehold.co/600x400?text=No+Image';
            }
            return product;
        });
        
        console.log('Products loaded successfully:', processedData);
        return processedData;
    } catch (error) {
        console.error('Error in loadProducts:', error);
        throw error;
    }
}

async function deleteProduct(productId) {
    try {
        // First get the product to get the image URL
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('image_url')
            .eq('id', productId)
            .single();
            
        if (fetchError) throw fetchError;
        
        // Delete the image from storage
        if (product.image_url) {
            const imagePath = product.image_url.split('/').pop();
            await supabase.storage
                .from('products')
                .remove([imagePath]);
        }
        
        // Delete the product from the database
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);
            
        if (error) throw error;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

async function updateProduct(productId, updates) {
    try {
        const { data, error } = await supabase
            .from('products')
            .update({
                ...updates,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId);
            
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

// Expose other necessary functions to window object
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.updateProduct = updateProduct; 