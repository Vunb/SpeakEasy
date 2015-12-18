import tensorflow.python.platform

import tensorflow as tf

from tensorflow.models.rnn import linear
from tensorflow.models.rnn import rnn
from tensorflow.models.rnn import rnn_cell

from rnn import seq2seq

sess = tf.Session()

#cell size
single_cell = rnn_cell.BasicLSTMCell(2)

#num hidden layers
cell = rnn_cell.MultiRNNCell([single_cell] * 2)

encoder_inputs = []
encoder_inputs.append(tf.placeholder(tf.float32, shape=[None, 2]))
decoder_inputs = []
decoder_inputs.append(tf.placeholder(tf.float32, shape=[None, 2]))

model = seq2seq.basic_rnn_seq2seq(encoder_inputs, decoder_inputs, cell)


#log directory
print(sess.graph_def)
print('here')
writer = tf.train.SummaryWriter('/Volumes/HD/SPEAKEASY_DATA/LOGGING/BasicLSTM', sess.graph_def)
sess.run(tf.initialize_all_variables())
