const Doctor = require("../models/doctor");
const Category = require("../models/category");
const appointmentController = require("./appointmentController");
const User = require("../models/user");

async function getAllDoctor(){
    try{
        const doctors = await Doctor.findAll({
            include: Category
        });
        return doctors;
    }
    catch(err){
        throw err;
    }

}

async function findDoctor(data){
    try{
        const doctor = await Doctor.findByPk(data);
        return doctor;
    }
    catch(err){
        throw err;
    }
}
async function findDoctorByCategory(id_cat){
    try{
        const doctor = await Doctor.findAndCountAll({
            where: {
                id_category : id_cat
            }
        });
        return doctor;
    }
    catch(err){
        throw err;
    }
}

async function createDoctor(data, id_users) {
    try{
        let id = "";
        const checkempty = await Doctor.findAndCountAll();
        console.log(checkempty);
        if(checkempty.count <= 0){
            id = "DC001";
        }
        else{
            const last = await Doctor.findOne({
                order: [["id_doctor", "DESC"]]
            });
            console.log(last);
            const newNum = parseInt(last.id_doctor.slice(2), 10) + 1;
            id = "DC" + String(newNum).padStart(3, '0');
        }
        console.log(data);
        
        const apt = await Doctor.create({
            id_doctor: id,
            id_user: id_users,
            id_category: data.category,
            first_name: data.first_name,
            last_name: data.last_name,
            gender: data.gender,
            degree: data.degree,
            experience: data.experience,
            
        });

        return apt
    }catch(err){
        throw err;
    }
}

async function  updateDoctor(data) {
    try{
        const updated = await Doctor.update({
            id_category: data.category,
            first_name: data.first_name,
            last_name: data.last_name,
            gender: data.gender,
            degree: data.degree,
            experience: data.experience,
            last_updated_at: Date.now() 
        },
        {
            where: {
                id_doctor: data.id_doctor
            }
        }
    );
        return updated;

    }
    catch(err){
        throw err;
    }
}

async function deleteDoctor(idPK){
    try{
            const us = await findDoctor(idPK);
            const apt = await appointmentController.activeAppointment(idPK);

            if(!apt){
                await appointmentController.deleteByDoctor(idPK);

                // 2️⃣ Delete the doctor record
                await Doctor.destroy({
                    where: { id_doctor: idPK }
                });

                // 3️⃣ Delete the user record
                await User.destroy({
                    where: { id_user: us.id_user }
                });

                return true;
            }
            else{
                return false; 
            }
            
    }
    catch(err){
        throw err;
    }
}

module.exports = {getAllDoctor, findDoctor, updateDoctor, createDoctor, deleteDoctor, findDoctorByCategory}