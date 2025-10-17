const User = require('../models/user');
const Patient = require('../models/patient');
const patientController = require("./patientController");
const doctorController = require("./doctorController");

async function createUserPatient(data){
    try{
        let id = "";
        const checkempty = await User.findAndCountAll();
        console.log(checkempty);
        if(checkempty.count <= 0){
            id = "US001";
        }
        else{
            const last = await User.findOne({
                order: [["id_user", "DESC"]]
            });
            if (!last || !last.id_user) {
                id = "US001";
            } else {
                const numPart = parseInt(last.id_user.slice(2), 10);
                const newNum = isNaN(numPart) ? 1 : numPart + 1;
                id = "US" + String(newNum).padStart(3, "0");
            }
        }

        
        const apt = await User.create({
            id_user: id,
            username: data.username || '-',
            email: data.email || '-',
            phone: data.phone || '-',
            password: data.password || '-',
            role: "patient",
        });

        await patientController.createPatient(data, id);
        
        return apt;    
    }
    catch(err){
        throw err;
    }
}
async function findByUsername(username) {
    return await User.findOne(
        {
            where:{
                username
            }
        }
    );
}
async function findByPhone(phone) {
    return await User.findOne(
        {
            where:{
                phone
            }
        }
    );
}
async function findByEmail(email) {
    return await User.findOne(
        {
            where:{
                email
            }
        }
    );
}

async function findById(id) {
    return await User.findByPk(id);
}

async function createUserDoctor(data) {
    try{
        let id = "";
        const checkempty = await User.findAndCountAll();
        console.log(checkempty);
        if(checkempty.count <= 0){
            id = "US001";
        }
        else{
            const last = await User.findOne({
                order: [["id_user", "DESC"]]
            });
            console.log(last);
            const newNum = parseInt(last.id_user.slice(2), 10) + 1;
            id = "US" + String(newNum).padStart(3, '0');
        }

        const apt = await User.create({
            id_user: id,
            username: "-",
            email: "-",
            phone: "-",
            password: "-",
            role: "doctor",
            
            
        });

        await doctorController.createDoctor(data, id);
        
        return apt;    

    }
    catch(err){
        throw err;
    }
    
}

async function deleteUser(idPk) {
    try{
        await User.destroy({
            where: {
                id_user: idPk,

            }
        });
        return true
    }
    catch(err){
      throw err
    }
}

async function updateUser(id_user, updates) {
    try {
        const updated = await User.update(updates, { where: { id_user } });
        return updated;
    } catch (err) {
        throw err;
    }
}

module.exports = {createUserPatient, createUserDoctor,findByUsername, findByPhone, findByEmail, findById, deleteUser, updateUser}