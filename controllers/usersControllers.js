const User = require('../models/userModels')


const createUsers = async (req, res) => {
   console.log("💡 Données reçues :", req.body);
  try {
    const { prenom , email, password, isAdmin } = req.body;
    if (!prenom || !email || !password) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires" });
    }

    // vérifier si l'utilisateur existe
    const userExist = await User.findOne({ email });
    if (userExist)
      return res.status(400).json({ message: "Email deja utilisé" });

    // const hashedPassword = await bcrypt.hash(password, 10);

    // creer l'utilisateur
    const user = await User.create({ prenom, email, password, isAdmin: true });

    // Génère le token
    const token = user.generateToken();

    // Envoie le cookie avec le token
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 jours
      sameSite: "none",
      secure: true,
    });

    // renvoyer le token
    res.status(201).json({
      message: "Utilisateur créé",
      user: {
        id: user._id,
        prenom,
        email,
        isAdmin,
      },
      token,
    });
    console.log("utilisateur créer", user);
    console.log("id de user", user._id);
  } catch (error) {
    console.error("erreur d'inscription", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("email et password", email, password);

    // Chercher l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      // Email non trouvé
      return res
        .status(404)
        .json({ message: "Cet email n'existe pas. Veuillez vous inscrire." });
    }
    if (!user)
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });

    // Vérifier le mot de passe
    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Email ou mot de passe incorrect" });

    // Générer le token
    const token = user.generateToken();

    // Renvoyer les infos utilisateur (sans le mot de passe)
    res.json({
      message: "Connexion réussie",
      user: {
        id: user._id,
        prenom: user.prenom,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
    console.log("utilisateur recuperér", user);
  } catch (error) {
    console.error("Erreur lors du login :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Deconnexion avec success" });
};

//GET users
const getUserProfile = async (req, res) => {
  console.log("req.user dans getUserProfile:", req.user);

  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    console.error("Erreur récupération profil :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json(user);
  } catch (error) {
    console.error("Erreur récupération utilisateur par ID :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//UPDATE
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    console.log(user);

    // Mise à jour uniquement du prénom et du mot de passe
    if (req.body.prenom) {
      user.prenom = req.body.prenom;
    }

    if (req.body.photo) {
      user.photo = req.body.photo;
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    const token = updatedUser.generateToken();

    res.json({
      message: "Profil mis à jour",
      user: {
        id: updatedUser._id,
        prenom: updatedUser.prenom,
        email: updatedUser.email, // affichage, mais non modifiable
        photo: updatedUser.photo,
        isAdmin: updatedUser.isAdmin,
        profileImage: updatedUser.profileImage,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur mise à jour :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//GET All users
const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select("-password"); // sans les mots de passe
      res.status(200).json(users);
    } catch (error) {
      console.error("Erreur récupération des utilisateurs :", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };
  
//DELETE   
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // 🗑 Supprimer tous les rapports liés à cet utilisateur
    await Rapport.deleteMany({ userId: user._id });

    // ✅ Supprimer ensuite l'utilisateur
    await user.deleteOne();

    res.status(200).json({ message: "Utilisateur et ses rapports supprimés avec succès" });
  } catch (error) {
    console.error("Erreur suppression utilisateur :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

//DELETE   
// const deleteUser = async (req, res) => {
//     try {
//       const user = await User.findById(req.params.id);
//       if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
  
//       await user.deleteOne();
//       res.status(200).json({ message: "Utilisateur supprimé avec succès" });
//     } catch (error) {
//       console.error("Erreur suppression utilisateur :", error);
//       res.status(500).json({ message: "Erreur serveur" });
//     }
//   };

  // Contrôleur Google login
const loginWithGoogle = async (req, res) => {
  const { email, prenom } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Email non reconnu. Veuillez vous inscrire." });
    }

    // Générer un token JWT
    const token = user.generateToken();

    res.json({
      message: "Connexion via Google réussie",
      user: {
        id: user._id,
        prenom: user.prenom,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion Google :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const registerWithGoogle = async (req, res) => {
  try {
    const { email, prenom } = req.body;

    if (!email || !prenom) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email déjà utilisé, veuillez vous connecter." });
    }

    // Crée un utilisateur avec un mot de passe aléatoire (ou vide si non nécessaire)
    const randomPassword = Math.random().toString(36).slice(-8); // ex : 'x8d3t9zq'

    const newUser = await User.create({
      prenom,
      email,
      password: randomPassword,
    });

    const token = newUser.generateToken();

    res.status(201).json({
      message: "Inscription avec Google réussie",
      user: {
        id: newUser._id,
        prenom: newUser.prenom,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error("Erreur Google register:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

module.exports = {
  createUsers,
  loginUser,
  getUserProfile,
  getUserById,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  logout,
  loginWithGoogle,
  registerWithGoogle,
};
