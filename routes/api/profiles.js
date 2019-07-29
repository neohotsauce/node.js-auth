const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
const request = require('request')
const config = require('config')

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route  GET api/profiles/me
// @desc   Get current users profile
// @access Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res
        .status(400)
        .json({ errors: [{ msg: "There is no profile for this user" }] });
    }

    res.json(profile);
  } catch (err) {
    res.status(400).json({ errors: [{ msg: err.message }] });
  }
});

// @route  POST api/profiles
// @desc   Create or update user profile
// @access Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    //build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    //build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      //update
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user, id },
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //create
      profile = new Profile(profileFields);
      profile = await profile.save();
      res.json(profile);
    } catch (err) {
      res.status(400).json({ errors: [{ msg: err.message }] });
    }
  }
);

// @route   GET api/profiles
// @desc    Get all profiles
// @access  Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.send(profiles);
  } catch (err) {
    res.status(400).json({ errors: [{ msg: err.meassage }] });
  }
});

// @route   GET api/profiles/user/:user_id
// @desc    Get profile by user Id
// @access  Public

router.get("/users/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate("user", ["name", "avatar"]);
    if (!profile)
      return res.status(400).json({ errors: [{ msg: "Profile not found" }] });
    res.send(profile);
  } catch (err) {
    if (err.kind == "ObjectId")
      return res.status(400).json({ errors: [{ msg: "Profile not found" }] });
    res.status(400).json({ errors: [{ msg: err.message }] });
  }
});

// @route   DELETE api/profiles
// @desc    Delete profile, user & posts
// @access  Private

router.delete("/", auth, async (req, res) => {
  try {
    // @tofo remove users, posts
    //remove profile
    const profile = await Profile.findOneAndRemove({ user: req.user.id });
    //remove user
    const user = await User.findOneAndRemove({ _id: req.user.id });

    const removedContent = { profile, user };

    res.send(removedContent);
  } catch (err) {
    res.status(400).json({ errors: [{ msg: err.meassage }] });
  }
});

// @route   PUT api/profiles/experience
// @desc    Add profile experience
// @access  Private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("company", "Company is required")
        .not()
        .isEmpty(),
      check("from", "From is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      current
    };

    if (to) newExp.to = to;
    if (description) newExp.description = description;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp);

      profile = await profile.save();

      res.json(profile);
    } catch (err) {
      res.status(400).json({ errors: [{ msg: err.message }] });
    }
  }
);

// @route   PUT api/profiles/experience/:exp_id
// @desc    Update experience
// @access  Private
router.put(
  "/experience/:exp_id",
  [
    auth,
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("company", "Company is required")
        .not()
        .isEmpty(),
      check("from", "From is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      current
    };

    if (to) newExp.to = to;
    if (description) newExp.description = description;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      // check if experience exists
      const matchingExp = await profile.experience.filter(item => {
        return item.id === req.params.exp_id;
      });
      if (!matchingExp[0]) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Experience not found" }] });
      }

      //delete experience from array
      profile.experience = await profile.experience.filter(item => {
        return item.id !== req.params.exp_id;
      });
      //put experience to array
      profile.experience.push(newExp);

      profile = await profile.save();
      res.json(profile);
    } catch (err) {
      res.status(400).json({ errors: [{ msg: err.message }] });
    }
  }
);

// @route   DELETE api/profiles/experience/:exp_id
// @desc    Delete experience from profile
// @access  Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    // check if experience exists
    const matchingExp = await profile.experience.filter(item => {
      return item.id === req.params.exp_id;
    });
    if (!matchingExp[0]) {
      return res
        .status(400)
        .json({ errors: [{ msg: "Experience not found" }] });
    }

    //delete experience from array
    profile.experience = await profile.experience.filter(item => {
      return item.id !== req.params.exp_id;
    });
    profile = await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(400).json({ errors: [{ msg: err.message }] });
  }
});

// @route   PUT api/profiles/education
// @desc    Add profile education
// @access  Private

router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required")
        .not()
        .isEmpty(),
      check("degree", "Degree is required")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Field of study is required")
        .not()
        .isEmpty(),
      check("from", "From is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      current
    };

    if (to) newEdu.to = to;
    if (description) newEdu.description = description;
    if (fieldofstudy) newEdu.fieldofstudy = fieldofstudy;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      profile.education.unshift(newEdu);

      profile = await profile.save();

      res.json(profile);
    } catch (err) {
      res.status(400).json({ errors: [{ msg: err.message }] });
    }
  }
);

// @route   PUT api/profiles/education/:edu_id
// @desc    Update education
// @access  Private
router.put(
  "/education/:edu_id",
  [
    auth,
    [
      check("school", "School is required")
        .not()
        .isEmpty(),
      check("degree", "Degree is required")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Field of study is required")
        .not()
        .isEmpty(),
      check("from", "From is required")
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      current
    };

    if (to) newEdu.to = to;
    if (description) newEdu.description = description;
    if (fieldofstudy) newEdu.fieldofstudy = fieldofstudy;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      // check if education exists
      const matchingEdu = await profile.education.filter(item => {
        return item.id === req.params.edu_id;
      });
      if (!matchingEdu[0]) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Education not found" }] });
      }

      //delete education from array
      profile.education = await profile.education.filter(item => {
        return item.id !== req.params.edu_id;
      });
      //put education to array
      profile.education.push(newEdu);

      profile = await profile.save();
      res.json(profile);
    } catch (err) {
      res.status(400).json({ errors: [{ msg: err.message }] });
    }
  }
);

// @route   DELETE api/profiles/education/:edu_id
// @desc    Delete education from profile
// @access  Private

router.delete("/education/:edu_id", auth, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id });

    // check if education exists
    const matchingEdu = await profile.education.filter(item => {
      return item.id === req.params.edu_id;
    });
    if (!matchingEdu[0]) {
      return res.status(400).json({ errors: [{ msg: "Education not found" }] });
    }

    //delete education from array
    profile.education = await profile.education.filter(item => {
      return item.id !== req.params.edu_id;
    });
    profile = await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(400).json({ errors: [{ msg: err.message }] });
  }
});

// @route   GET api/profiles/github/:username
// @desc    Get user repos from github
// @access  Public
router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: {'user-agent': 'node.js'}
    }

    request(options, (err, response, body) => {
      if (err) return res.status(400).json({ errros: [{ msg: err.message }] })
      if(response.statusCode !==200) {
        return res.status(400).json({ errros: [{ msg: 'Not Github profile found' }] })
      }

      res.json(JSON.parse(body));
    })


  } catch (err) {
    res.status(400).json({errros: [{msg: err.message}]})
  }
})

module.exports = router;
