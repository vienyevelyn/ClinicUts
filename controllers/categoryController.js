const doctorController = require("./doctorController");
const Category = require("../models/category");

async function getAllCategory(){
    try{
        const categories = await Category.findAll();
        return categories;
    }
    catch(err){
        throw err;
    }

}

async function createCategory(data) {
    try{
        let id = "";
        const checkempty = await Category.findAndCountAll();
        console.log(checkempty);
        if(checkempty.count <= 0){
            id = "CT001";
        }
        else{
            
            const last = await Category.findOne({
                order: [["id_category", "DESC"]]
            });
                const newNum = parseInt(last.id_category.slice(2), 10) + 1;
                id = "CT" + String(newNum).padStart(3, '0');
                
            }
            const categorySame = await Category.findOne({
                where: {
                    name: data.name
                },
            });
            
            if(categorySame){
                return false;
            }
            else{
                const apt = await Category.create({
                id_category : id,
                name : data.name
            });
            return apt;

            }
            
            
            }
            
    
    catch(err){
        throw err;
    }
}

async function deleteCategory(idPK) {
     try{

        const doctorada = await doctorController.findDoctorByCategory(idPK)
        if(doctorada.count > 0){
            return false;
        }else{
            await Category.destroy({
            where: {
                id_category: idPK
            },
          
            });
        }
            

        return true
    }
    catch(err){
        throw err;
    }
}

module.exports = {getAllCategory, createCategory, deleteCategory}