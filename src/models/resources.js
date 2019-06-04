/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('resources', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "O nome não pode estar vazio!"
        },
        len: {
          args: [3, 30],
          msg: "Esse campo deve ter entre 3 e 30 caracteres"
        }
      }
    },
    personagem: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "O personagem não pode estar vazio!"
        },
        len: {
          args: [3, 30],
          msg: "Esse campo deve ter entre 3 e 20 caracteres"
        }
      }
    },
    descricao: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "O nome não pode estar vazio!"
        },
        max: {
          msg: "Esse campo não pode passar de 300 caracteres!"
        }
      }
    }
  }, {
    tableName: 'resources',
    timestamps: false
  });
};
